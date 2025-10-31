// app/api/posts/[postId]/like/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/models/Post";
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

export async function PUT(
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
    const post = await PostModel.findById(postId);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if the user has already liked the post
    const userIndex = post.likes.indexOf(userId);

    if (userIndex > -1) {
      // User has liked the post, so unlike it
      post.likes.pull(userId);
    } else {
      // User has not liked the post, so like it
      post.likes.push(userId);
    }

    await post.save();

    return NextResponse.json({ message: "Like status updated", post }, { status: 200 });

  } catch (error) {
    console.error("Error updating like status:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}