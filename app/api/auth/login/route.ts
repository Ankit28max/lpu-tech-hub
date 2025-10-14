// app/api/auth/login/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { NextResponse } from "next/server";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const { email, password } = result.data;

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Compare the provided password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET!,                  // Secret key
      { expiresIn: "1d" }                      // Expiration time
    );

    const userResponse = {
  _id: user._id,
  username: user.username,
  email: user.email,
};

return NextResponse.json(
  { message: "Login successful", token, user: userResponse },
  { status: 200 }
);

  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json(
      { message: "An error occurred during login." },
      { status: 500 }
    );
  }
}