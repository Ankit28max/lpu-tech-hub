// app/api/auth/register/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextResponse } from "next/server";

const UserRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const result = UserRegistrationSchema.safeParse(body);

    if (!result.success) {
      // If validation fails, return the errors
      const errors = result.error.format();
      return NextResponse.json(
        { message: "Invalid input", errors },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;

    // Check if user with the same username or email already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or username already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({
      username,
      email,
      passwordHash: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}