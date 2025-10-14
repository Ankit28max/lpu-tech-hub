// app/api/posts/[postId]/comments/route.ts
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
    } catch (error) { return null; }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  await dbConnect();
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
        return NextResponse.json({ message: "Comment content is required" }, { status: 400 });
    }

    const post = await PostModel.findById(params.postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = {
        content,
        author: userId,
        createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    return NextResponse.json({ message: "Comment added", post }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}