// import connectToDb from "@/libraries/mongodb";
// import Image from "@/models/image";
// import Interaction from "@/models/interaction";
// import { NextResponse } from "next/server";

// export const GET = async (req, { params }) => {
//   try {
//     await connectToDb();
//     const { id } = params;

//     const img = await Image.findById(id);
//     if (!img) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Image not found.",
//         },
//         { status: 404 }
//       );
//     }

//     // ⚠️ Retrieve userId from header or auth session
//     // For example, if you use next-auth:
//     // const session = await getServerSession(authOptions)
//     // const userId = session?.user?.id

//     const userId = req.headers.get("x-user-id"); // For now, or adapt to your auth
//     if (userId) {
//       await Interaction.updateOne(
//         {
//           userId,
//           imageId: img._id,
//           type: "view",
//         },
//         {
//           $setOnInsert: { createdAt: new Date() },
//         },
//         { upsert: true }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         img,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error while fetching image: ", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Error while fetching image.",
//       },
//       { status: 500 }
//     );
//   }
// };

import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectToDb();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let images;
    if (search) {
      images = await Image.find({
        $or: [
          { description: { $regex: search, $options: "i" } },
          { mood: { $regex: search, $options: "i" } },
          { creator_profile: { $regex: search, $options: "i" } },
        ],
      });
    } else {
      images = await Image.find().sort({ createdAt: -1 });
    }

    return NextResponse.json(
      { success: true, images },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching images." },
      { status: 500 }
    );
  }
};
