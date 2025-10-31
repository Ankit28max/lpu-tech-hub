// app/api/posts/[postId]/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/models/Post";
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
};

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    await dbConnect();

    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        
        // Find the post and check if user is the author
        const post = await PostModel.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        // Check if user is the author of the post
        if (post.author.toString() !== userId) {
            return NextResponse.json({ message: "You can only delete your own posts" }, { status: 403 });
        }

        // Delete the post
        await PostModel.findByIdAndDelete(postId);

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ message: "An error occurred while deleting the post." }, { status: 500 });
    }
}
