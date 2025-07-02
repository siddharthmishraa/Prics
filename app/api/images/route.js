import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import { NextResponse } from "next/server";

// export const GET = async (req) => {
//   await connectToDb();

//   const search = req.nextUrl.searchParams.get("search");
//   let images;

//   if (search) {
//     const regex = new RegExp(search, "i");

//     images = await Image.find({
//       $or: [
//         { description: { $regex: regex } },
//         { mood: { $elemMatch: { $regex: regex } } },
//       ]
//     });
//   } else {
//     images = await Image.find();
//   }

//   return NextResponse.json({ success: true, images }, { status: 200 });
// };

export const GET = async (req) => {
  await connectToDb();

  const search = req.nextUrl.searchParams.get("search");
  let images;

  if (search) {
    const regex = new RegExp(search, "i");

    images = await Image.aggregate([
      {
        $addFields: {
          creatorName: {
            $arrayElemAt: [
              { $filter: {
                input: { $split: ["$creator_profile", "/"] },
                as: "part",
                cond: { $ne: ["$$part", ""] }
              }},
              -1
            ]
          }
        }
      },
      {
        $match: {
          $or: [
            { description: { $regex: regex } },
            { mood: { $elemMatch: { $regex: regex } } },
            { creatorName: { $regex: regex } }
          ]
        }
      }
    ]);
  } else {
    images = await Image.find();
  }

  return NextResponse.json({ success: true, images }, { status: 200 });
};