// app/api/trending/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/models/Post";

export async function GET(request: NextRequest) {
    await dbConnect();
    
    try {
        // Get trending hashtags from posts
        const posts = await PostModel.find({})
            .select('tags createdAt')
            .sort({ createdAt: -1 })
            .limit(100);

        // Count hashtag occurrences
        const hashtagCounts: { [key: string]: number } = {};
        posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
                });
            }
        });

        // Convert to array and sort by count
        const trendingTopics = Object.entries(hashtagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get category statistics
        const categoryStats = await PostModel.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        return NextResponse.json({ 
            trendingTopics,
            categoryStats: categoryStats.map(stat => ({
                category: stat._id || 'general',
                count: stat.count
            }))
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching trending topics:", error);
        return NextResponse.json({ message: "An error occurred while fetching trending topics." }, { status: 500 });
    }
}
