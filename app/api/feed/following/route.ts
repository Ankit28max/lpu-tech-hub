import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/Post";
import User from "@/models/User";
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

export async function GET(request: NextRequest) {
  await dbConnect();
  const meId = getUserIdFromToken(request);
  if (!meId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const me = await User.findById(meId).select('following');
    const followingIds = (me?.following || []).map((id: unknown) => id);
    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: -1 });
    return NextResponse.json({ posts }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to fetch following feed' }, { status: 500 });
  }
}


