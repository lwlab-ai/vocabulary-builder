import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const allowedEmails = process.env.ALLOWED_EMAILS
    if (allowedEmails) {
      const allowList = allowedEmails.split(",").map((e) => e.trim().toLowerCase())
      if (!allowList.includes(email.toLowerCase())) {
        return NextResponse.json({ error: "🙇🏻‍♀️ Sorry! you are not on the invite list. Please contact me at daisyhuang1993@gmail.com to get access." }, { status: 403 })
      }
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
