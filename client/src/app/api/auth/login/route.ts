import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

const SECRET_KEY = process.env.JWT_SECRET || '123-456-7890';

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const { email, password } = await req.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Ensure `email` is included
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Error logging in" }, { status: 500 })
  }
}

