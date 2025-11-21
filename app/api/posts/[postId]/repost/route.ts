import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/Post";
import jwt, { JwtPayload } from 'jsonwebtoken';

const getUserIdFromToken = (request: NextRequest): string | null => {
  const token = request.headers.get("authorization")?.split(" ")[1] || "";
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  await dbConnect();
  const userId = getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { postId } = await params;
  try {
    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    const hasReposted = post.reposts.some((id: unknown) => String(id) === String(userId));
    if (hasReposted) {
      post.reposts = post.reposts.filter((id: unknown) => String(id) !== String(userId));
    } else {
      post.reposts.push(userId as unknown as import('mongoose').Types.ObjectId);
    }
    await post.save();
    return NextResponse.json({ reposts: post.reposts.length, reposted: !hasReposted }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to toggle repost' }, { status: 500 });
  }
}


