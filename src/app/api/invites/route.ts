import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  const [pending, signedUp] = await Promise.all([
    prisma.invite.findMany({
      where: { invitedBy: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { invitedBy: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    }),
  ])

  return NextResponse.json({ pending, signedUp })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) {
    return NextResponse.json({ error: "This person already has an account" }, { status: 409 })
  }

  const existingInvite = await prisma.invite.findUnique({ where: { email: normalizedEmail } })
  if (existingInvite) {
    return NextResponse.json({ error: "This email has already been invited" }, { status: 409 })
  }

  const invite = await prisma.invite.create({
    data: { email: normalizedEmail, invitedBy: userId },
    select: { id: true, email: true, createdAt: true },
  })

  return NextResponse.json(invite, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Invite ID required" }, { status: 400 })
  }

  const invite = await prisma.invite.findUnique({ where: { id } })
  if (!invite || invite.invitedBy !== userId) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 })
  }

  await prisma.invite.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
