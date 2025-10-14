// app/api/users/[username]/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import {NextRequest, NextResponse} from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  try {
    const username = params.username;

    // Find the user by username
    const user = await UserModel.findOne({ username }).select("-passwordHash"); // Exclude password

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find all posts by that user
    const posts = await PostModel.find({ author: user._id })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ user, posts }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the profile." },
      { status: 500 }
    );
  }
}