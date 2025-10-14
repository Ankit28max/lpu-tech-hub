// app/api/profile/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import { z } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';

const getUserIdFromToken = (request: NextRequest): string | null => {
    const token = request.headers.get("authorization")?.split(" ")[1] || "";
    if (!token) return null;
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decodedToken.userId;
    } catch (error) {
        return null;
    }
}

const ProfileUpdateSchema = z.object({
  bio: z.string().max(200).optional(),
  isAcceptingMentees: z.boolean().optional(),
  mentorshipSkills: z.array(z.string()).optional(),
});

export async function PUT(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const body = await request.json();
        const result = ProfileUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error.format() }, { status: 400 });
        }
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: result.data },
            { new: true, runValidators: true }
        ).select("-passwordHash");

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ message: "An error occurred while updating the profile." }, { status: 500 });
    }
}

// Add this GET function to app/api/profile/route.ts

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const user = await UserModel.findById(userId).select("-passwordHash");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ message: "An error occurred while fetching the profile." }, { status: 500 });
    }
}