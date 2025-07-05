import connectToDb from "@/libraries/mongodb";
import image from "@/models/image";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    await connectToDb();
    console.log("inside like/save API");

    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized Access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const img = await image.findById(id);

    if (!img) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    // ✅ saves is an array of Strings, so check index with string match
    const userIndex = img.saves.indexOf(token.name);

    if (userIndex > -1) {
      img.saves.splice(userIndex, 1);
      await img.save();
      return NextResponse.json(
        { success: true, message: "Removed from Saved" },
        { status: 200 }
      );
    } else {
      img.saves.push(token.name); // ✅ push string, not object!
      await img.save();
      return NextResponse.json(
        { success: true, message: "Saved" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("SAVE API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server error." },
      { status: 500 }
    );
  }
}
