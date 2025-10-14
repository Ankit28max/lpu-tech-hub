// app/api/hello/route.ts
import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    return NextResponse.json({ message: "Successfully connected to MongoDB!" });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { message: "Error connecting to MongoDB", error },
      { status: 500 }
    );
  }
}