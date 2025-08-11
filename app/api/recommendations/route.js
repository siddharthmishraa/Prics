// import connectToDb from "@/libraries/mongodb";
// import Image from "@/models/image";
// import Interaction from "@/models/interaction";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";

// export const GET = async (req) => {
//   try {
//     await connectToDb();

//     const userId = req.headers.get("x-user-id");
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid or missing user ID" },
//         { status: 400 }
//       );
//     }

//     // ✅ 1. Fetch saved and viewed images
//     const [savedImages, viewedInteractions] = await Promise.all([
//       Image.find({ saves: userId }),
//       Interaction.find({ userId, type: "view" }),
//     ]);

//     const viewedImageIds = viewedInteractions.map((i) => i.imageId.toString());
//     const savedImageIds = savedImages.map((i) => i._id.toString());

//     const viewedImages = await Image.find({
//       _id: { $in: viewedImageIds },
//     });

//     // ✅ 2. Build mood & creator profile
//     const allImages = [...savedImages, ...viewedImages];
//     const moodCount = {};
//     const creatorCount = {};

//     // allImages.forEach((img) => {
//     //   img.mood.forEach((m) => {
//     //     moodCount[m] = (moodCount[m] || 0) + 1;
//     //   });
//     //   creatorCount[img.creator_profile] =
//     //     (creatorCount[img.creator_profile] || 0) + 1;
//     // });

//     allImages.forEach((img) => {
//       const weight = savedImageIds.includes(img._id.toString()) ? 2 : 1;
//       img.mood.forEach((m) => {
//         moodCount[m] = (moodCount[m] || 0) + weight;
//       });
//       creatorCount[img.creator_profile] =
//         (creatorCount[img.creator_profile] || 0) + weight;
//     });


//     const topMoods = Object.entries(moodCount)
//       .sort((a, b) => b[1] - a[1])
//       .map(([m]) => m)
//       .slice(0, 5);

//     const topCreators = Object.entries(creatorCount)
//       .sort((a, b) => b[1] - a[1])
//       .map(([c]) => c)
//       .slice(0, 5);

//     // ✅ 3. Get recommended images based on scoring
//     const interactedIds = [...new Set([...viewedImageIds, ...savedImageIds])].map((id) =>
//       new mongoose.Types.ObjectId(id)
//     );

//     const recommendations = await Image.aggregate([
//       {
//         $match: {
//           _id: { $nin: interactedIds },
//         },
//       },
//       {
//         $addFields: {
//           moodOverlap: { $size: { $setIntersection: ["$mood", topMoods] } },
//           creatorMatch: {
//             $cond: [{ $in: ["$creator_profile", topCreators] }, 1, 0],
//           },
//           popularity: { $size: "$saves" },
//           freshness: {
//             $cond: [
//               {
//                 $gte: [
//                   "$createdAt",
//                   new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
//                 ],
//               },
//               1,
//               0,
//             ],
//           },
//           randomScore: { $rand: {} },
//         },
//       },
//       {
//         $addFields: {
//           totalScore: {
//             $add: [
//               { $multiply: ["$moodOverlap", 3] },
//               { $multiply: ["$creatorMatch", 4] },
//               { $multiply: ["$popularity", 1] },
//               { $multiply: ["$freshness", 2] },
//               { $multiply: ["$randomScore", 1.5] },
//             ],
//           },
//         },
//       },
//       { $sort: { totalScore: -1 } },
//       { $limit: 20 },
//     ]);

//     return NextResponse.json({ success: true, recommendations }, { status: 200 });
//   } catch (error) {
//     console.error("Recommendation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// };

import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req) => {
  try {
    await connectToDb();

    const url = new URL(req.url);
    const imageId = url.searchParams.get("imageId");

    // ============ DETAIL PAGE MODE ============
    if (imageId && mongoose.Types.ObjectId.isValid(imageId)) {
      const currentImage = await Image.findById(imageId).lean();
      if (!currentImage) {
        return NextResponse.json(
          { success: false, message: "Image not found" },
          { status: 404 }
        );
      }

      const { mood = [], creator_profile } = currentImage;
      const excludeIds = [new mongoose.Types.ObjectId(imageId)];

      const relatedImages = await Image.aggregate([
        {
          $match: {
            _id: { $nin: excludeIds },
            $or: [
              { mood: { $in: mood } },
              { creator_profile: creator_profile },
            ],
          },
        },
        { $limit: 10 },
      ]);

      const relatedIds = relatedImages.map((img) => img._id);

      const trending = await Image.find({
        _id: { $nin: [...excludeIds, ...relatedIds] },
      })
        .sort({ saves: -1 })
        .limit(5)
        .lean();

      const fresh = await Image.find({
        _id: { $nin: [...excludeIds, ...relatedIds] },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      let recommendations = [...relatedImages, ...trending, ...fresh];
      const uniqueMap = new Map();
      recommendations.forEach((img) =>
        uniqueMap.set(img._id.toString(), img)
      );
      recommendations = Array.from(uniqueMap.values());

      const currentIds = recommendations.map((i) => i._id);
      const extra = await Image.find({
        _id: { $nin: [...excludeIds, ...currentIds] },
      }).lean();
      recommendations = [...recommendations, ...extra];

      // Limit to 10 images max for detail page mode
      recommendations = recommendations.slice(0, 10);

      return NextResponse.json({ success: true, recommendations }, { status: 200 });
    }

    // ============ HOMEPAGE MODE ============
    const trending = await Image.find({})
      .sort({ saves: -1 })
      .limit(5)
      .lean();

    const fresh = await Image.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const random = await Image.aggregate([{ $sample: { size: 5 } }]);

    let recommendations = [...trending, ...fresh, ...random];
    const uniqueMap = new Map();
    recommendations.forEach((img) =>
      uniqueMap.set(img._id.toString(), img)
    );
    recommendations = Array.from(uniqueMap.values());

    const currentIds = recommendations.map((i) => i._id);
    const extra = await Image.find({ _id: { $nin: currentIds } }).lean();
    recommendations = [...recommendations, ...extra];

    return NextResponse.json({ success: true, recommendations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching recommendations." },
      { status: 500 }
    );
  }
};
