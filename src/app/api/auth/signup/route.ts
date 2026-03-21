import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const invite = await prisma.invite.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!invite) {
      return NextResponse.json(
        { error: "You are not on the invite list. Ask an existing member to invite you." },
        { status: 403 },
      )
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: { email: normalizedEmail, passwordHash, invitedBy: invite.invitedBy },
        select: { id: true, email: true },
      }),
      prisma.invite.delete({ where: { id: invite.id } }),
    ])

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
