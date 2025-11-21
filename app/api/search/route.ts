// app/api/search/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/User";
import ProjectModel from "@/models/Project";
import PostModel from "@/models/Post";

export async function GET(request: NextRequest) {
    await dbConnect();

    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all'; // all, users, projects, posts

        if (!query || query.length < 2) {
            return NextResponse.json({
                users: [],
                projects: [],
                posts: []
            }, { status: 200 });
        }

        const searchRegex = new RegExp(query, 'i');
        const results: {
            users?: unknown[];
            projects?: unknown[];
            posts?: unknown[];
        } = {};

        // Search users/mentors
        if (type === 'all' || type === 'users') {
            results.users = await UserModel.find({
                $or: [
                    { username: searchRegex },
                    { bio: searchRegex },
                    { mentorshipSkills: searchRegex }
                ]
            })
                .select('username bio isAcceptingMentees mentorshipSkills')
                .limit(5)
                .lean();
        }

        // Search projects
        if (type === 'all' || type === 'projects') {
            results.projects = await ProjectModel.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { requiredSkills: searchRegex }
                ],
                status: 'open'
            })
                .populate('owner', 'username')
                .select('title description requiredSkills owner')
                .limit(5)
                .lean();
        }

        // Search posts
        if (type === 'all' || type === 'posts') {
            results.posts = await PostModel.find({
                content: searchRegex
            })
                .populate('author', 'username')
                .select('content author createdAt')
                .limit(5)
                .lean();
        }

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Error searching:", error);
        return NextResponse.json(
            { message: "An error occurred while searching." },
            { status: 500 }
        );
    }
}
