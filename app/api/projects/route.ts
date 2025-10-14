// app/api/projects/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import ProjectModel from "@/models/Project";
import { z } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';

const getUserIdFromToken = (request: NextRequest): string | null => {
    const token = request.headers.get("authorization")?.split(" ")[1] || "";
    if (!token) return null;
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decodedToken.userId;
    } catch (error) {
        return null;
    }
}

const ProjectSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  requiredSkills: z.array(z.string()).min(1, "At least one skill is required."),
});

// Handler to CREATE a new project
export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const body = await request.json();
        const result = ProjectSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error.format() }, { status: 400 });
        }

        const { title, description, requiredSkills } = result.data;
        
        const newProject = new ProjectModel({
            title,
            description,
            requiredSkills,
            owner: userId,
        });

        await newProject.save();

        return NextResponse.json({ message: "Project created successfully", project: newProject }, { status: 201 });

    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ message: "An error occurred while creating the project." }, { status: 500 });
    }
}

// Handler to GET all projects
export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const projects = await ProjectModel.find({ status: 'open' }) // Only find open projects
            .populate('owner', 'username') 
            .sort({ createdAt: -1 }); 

        return NextResponse.json({ projects }, { status: 200 });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ message: "An error occurred while fetching projects." }, { status: 500 });
    }
}