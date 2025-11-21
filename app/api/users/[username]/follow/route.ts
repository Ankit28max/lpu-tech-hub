import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  await dbConnect();
  const meId = getUserIdFromToken(request);
  if (!meId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { username: userId } = await params;
  if (meId === userId) return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 });

  try {
    const me = await User.findById(meId);
    const target = await User.findById(userId);
    if (!me || !target) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const isFollowing = me.following?.some((id: unknown) => String(id) === String(userId));
    if (isFollowing) {
      me.following = (me.following || []).filter((id: unknown) => String(id) !== String(userId));
      target.followers = (target.followers || []).filter((id: unknown) => String(id) !== String(meId));
    } else {
      me.following = [...(me.following || []), target._id];
      target.followers = [...(target.followers || []), me._id];
    }
    await me.save();
    await target.save();
    return NextResponse.json({ following: !isFollowing }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to toggle follow' }, { status: 500 });
  }
}


