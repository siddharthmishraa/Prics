import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import Interaction from "@/models/interaction";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = async (req) => {
  try {
    await connectToDb();

    const url = new URL(req.url);
    const imageId = url.searchParams.get("imageId");
    const userId = req.headers.get("x-user-id");

    // ===================================================
    // DETAIL PAGE MODE (LOGIN REQUIRED)
    // ===================================================
    if (imageId && mongoose.Types.ObjectId.isValid(imageId)) {
      // Require login for detail view
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: "Please log in to view detailed recommendations." },
          { status: 401 }
        );
      }

      // ---------- LOGGED IN: PERSONALIZED ----------
      const [savedImages, viewedInteractions] = await Promise.all([
        Image.find({ saves: userId }),
        Interaction.find({ userId, type: "view" }),
      ]);

      const viewedImageIds = viewedInteractions.map(i => i.imageId.toString());
      const savedImageIds = savedImages.map(i => i._id.toString());

      const viewedImages = await Image.find({
        _id: { $in: viewedImageIds },
      });

      // Build preference scores
      const moodCount = {};
      const creatorCount = {};
      const allImages = [...savedImages, ...viewedImages];

      allImages.forEach(img => {
        const weight = savedImageIds.includes(img._id.toString()) ? 2 : 1;
        img.mood.forEach(m => {
          moodCount[m] = (moodCount[m] || 0) + weight;
        });
        creatorCount[img.creator_profile] =
          (creatorCount[img.creator_profile] || 0) + weight;
      });

      const topMoods = Object.entries(moodCount)
        .sort((a, b) => b[1] - a[1])
        .map(([m]) => m)
        .slice(0, 5);

      const topCreators = Object.entries(creatorCount)
        .sort((a, b) => b[1] - a[1])
        .map(([c]) => c)
        .slice(0, 5);

      // Exclude viewed/saved/current image
      const excludeIds = [
        new mongoose.Types.ObjectId(imageId),
        ...new Set([...viewedImageIds, ...savedImageIds].map(id => new mongoose.Types.ObjectId(id)))
      ];

      // Aggregate scored recommendations
      const recommendations = await Image.aggregate([
        { $match: { _id: { $nin: excludeIds } } },
        {
          $addFields: {
            moodOverlap: { $size: { $setIntersection: ["$mood", topMoods] } },
            creatorMatch: {
              $cond: [{ $in: ["$creator_profile", topCreators] }, 1, 0],
            },
            popularity: { $size: "$saves" },
            freshness: {
              $cond: [
                { $gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0,
              ],
            },
            randomScore: { $rand: {} },
          },
        },
        {
          $addFields: {
            totalScore: {
              $add: [
                { $multiply: ["$moodOverlap", 3] },
                { $multiply: ["$creatorMatch", 4] },
                { $multiply: ["$popularity", 1] },
                { $multiply: ["$freshness", 2] },
                { $multiply: ["$randomScore", 1.5] },
              ],
            },
          },
        },
        { $sort: { totalScore: -1 } },
        // { $limit: 10 },
      ]);

      return NextResponse.json({ success: true, recommendations }, { status: 200 });
    }

    // ===================================================
    // HOMEPAGE MODE (PUBLIC)
    // ===================================================
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
    recommendations.forEach((img) => uniqueMap.set(img._id.toString(), img));
    recommendations = Array.from(uniqueMap.values());

    // Fill with remaining images so homepage always shows all
    const currentIds = recommendations.map((i) => i._id);
    const extra = await Image.find({ _id: { $nin: currentIds } }).lean();
    recommendations = [...recommendations, ...extra];

    return NextResponse.json({ success: true, recommendations }, { status: 200 });

  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
