// app/api/mentors/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import UserModel from "@/models/User";

export async function GET() {
    await dbConnect();
    try {
        const mentors = await UserModel.find({ isAcceptingMentees: true })
            .select("username bio mentorshipSkills"); // Select only public fields

        return NextResponse.json({ mentors }, { status: 200 });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        return NextResponse.json({ message: "An error occurred while fetching mentors." }, { status: 500 });
    }
}