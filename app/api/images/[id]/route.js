// import connectToDb from "@/libraries/mongodb";
// import image from "@/models/image";
// import { NextResponse } from "next/server";

// export const GET = async(req, {params}) => {
//     try {
//         await connectToDb();
//         const {id} = await params;
//         const img = await image.findById(id);
//         if(!img){
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Image not found."
//                 },
//                 {
//                     status: 404,
//                 }
//             );
//         }
//         return NextResponse.json(
//             {
//                 success: true,
//                 img,
//             },
//             {
//                 status: 200
//             }
//         );
//     } catch (error) {
//         console.error("Error while fetching image: ", error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Error while fetching image."
//             },
//             {
//                 status: 500,
//             }
//         )
//     }
// }

import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import Interaction from "@/models/interaction";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    await connectToDb();

    const { id } = params;
    const img = await Image.findById(id);
    if (!img) {
      return NextResponse.json(
        { success: false, message: "Image not found." },
        { status: 404 }
      );
    }

    // To log view from user
    const userId = req.headers.get("x-user-id");
    if (userId) {
      await Interaction.updateOne(
        { userId, imageId: img._id, type: "view" },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json(
      { success: true, img },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching image:", error);
    return NextResponse.json(
      { success: false, message: "Error while fetching image." },
      { status: 500 }
    );
  }
};
