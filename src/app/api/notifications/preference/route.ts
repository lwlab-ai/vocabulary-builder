import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_PREFS = ["OFF", "DAILY", "HOURLY"] as const
type NotificationPref = typeof VALID_PREFS[number]

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { preference } = await req.json()
  if (!VALID_PREFS.includes(preference)) {
    return NextResponse.json({ error: "Invalid preference" }, { status: 400 })
  }

  const data: { notificationPref: NotificationPref; pushSubscription?: null } = {
    notificationPref: preference
  }
  if (preference === "OFF") {
    data.pushSubscription = null
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data
  })

  return NextResponse.json({ success: true, preference })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notificationPref: true, pushSubscription: true }
  })

  return NextResponse.json({
    preference: user?.notificationPref ?? "OFF",
    hasSubscription: !!user?.pushSubscription
  })
}
