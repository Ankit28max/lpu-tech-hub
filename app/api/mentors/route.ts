// app/api/mentors/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";

export async function GET() {
    await dbConnect();
    try {
        const mentors = await UserModel.find({ isAcceptingMentees: true })
            .select("username bio mentorshipSkills role createdAt")
            .sort({ createdAt: -1 });

        // Get post counts for each mentor
        const mentorsWithStats = await Promise.all(
            mentors.map(async (mentor) => {
                const postCount = await PostModel.countDocuments({ author: mentor._id });
                return {
                    ...mentor.toObject(),
                    postCount
                };
            })
        );

        return NextResponse.json({ mentors: mentorsWithStats }, { status: 200 });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        return NextResponse.json({ message: "An error occurred while fetching mentors." }, { status: 500 });
    }
}