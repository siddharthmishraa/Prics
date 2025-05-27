import connectToDb from "@/libraries/mongodb";
import Image from "@/models/image";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  await connectToDb();

  const formData = await req.formData();

  const imgUrl = formData.get("imgUrl");
  const creator_profile = formData.get("creator_profile");
  const description = formData.get("description");
  const mood = formData.get("mood");

  if (!imgUrl || !creator_profile) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const moodArray = mood ? mood.split(",").map(tag => tag.trim()) : [];

  try {
    const createdImage = await Image.create({
      creator_profile,
      description,
      mood: moodArray,
      imgUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      createdImage,
    }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

export const GET = async (req) => {
  await connectToDb();

  const search = req.nextUrl.searchParams.get("search");
  let images;

  if (search) {
    const regex = new RegExp(search, "i");

    images = await Image.find({
      $or: [
        { description: { $regex: regex } },
        { mood: { $elemMatch: { $regex: regex } } },
      ]
    });
  } else {
    images = await Image.find();
  }

  return NextResponse.json({ success: true, images }, { status: 200 });
};
