// app/api/projects/[projectId]/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import ProjectModel from "@/models/Project";

// GET a single project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    await dbConnect();

    try {
        const { projectId } = await params;

        const project = await ProjectModel.findById(projectId)
            .populate('owner', 'username bio')
            .lean();

        if (!project) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ project }, { status: 200 });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching the project." },
            { status: 500 }
        );
    }
}
