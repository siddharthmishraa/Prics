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
