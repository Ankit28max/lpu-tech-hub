// app/api/posts/route.ts
import dbConnect from "@/lib/dbConnect";
import {NextRequest, NextResponse} from "next/server";
import PostModel from "@/models/Post";
import { z } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Helper function to get user ID from token
const getUserIdFromToken = (request: NextRequest): string | null => {
    const token = request.headers.get("authorization")?.split(" ")[1] || "";
    if (!token) return null;

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decodedToken.userId;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}

const PostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty").max(280),
});

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const body = await request.json();
        const result = PostSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid post content", errors: result.error.format() }, { status: 400 });
        }

        const { content } = result.data;
        
        const newPost = new PostModel({
            content,
            author: userId,
        });

        await newPost.save();

        return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 });

    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "An error occurred while creating the post." }, { status: 500 });
    }
}

// Add this GET function to app/api/posts/route.ts

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const posts = await PostModel.find({})
            .populate('author', 'username') // Populates the post's author
            .populate({ // 👇 This is the new part
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username' // Selects only the username for comment authors
                }
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ message: "An error occurred while fetching posts." }, { status: 500 });
    }
}