import connectToDb from "@/libraries/mongodb";
import image from "@/models/image";
import { NextResponse } from "next/server";

export const GET = async(req, {params}) => {
    try {
        await connectToDb();
        const {id} = await params;
        const img = await image.findById(id);
        if(!img){
            return NextResponse.json(
                {
                    success: false,
                    message: "Image not found."
                },
                {
                    status: 404,
                }
            );
        }
        return NextResponse.json(
            {
                success: true,
                img,
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error while fetching image: ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error while fetching image."
            },
            {
                status: 500,
            }
        )
    }
}