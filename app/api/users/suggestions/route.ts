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

export async function GET(request: NextRequest) {
  await dbConnect();
  const meId = getUserIdFromToken(request);
  if (!meId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const me = await User.findById(meId).select('following');
    const exclude = new Set([String(meId), ...(me?.following || []).map((id: unknown) => String(id))]);
    const suggestions = await User.find({ _id: { $nin: Array.from(exclude) } })
      .select('username')
      .limit(8);
    return NextResponse.json({ users: suggestions }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to fetch suggestions' }, { status: 500 });
  }
}


