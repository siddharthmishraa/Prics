import connectToDb from "@/libraries/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/user";

export async function POST(request) {
    try {
        await connectToDb();

        const body = await request.json();
        const { username, email, password } = body;

        // Validate inputs
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists." },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully.",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("User registration failed:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
