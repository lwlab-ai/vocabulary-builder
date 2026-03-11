import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureWordsForUser } from "@/lib/wordGenerator"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  try {
    const { categoryId } = await req.json()
    if (!categoryId || typeof categoryId !== "number") {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 })
    }

    const existing = await prisma.userCategory.findUnique({
      where: { userId_categoryId: { userId, categoryId } },
    })

    if (existing) {
      await prisma.userCategory.delete({ where: { id: existing.id } })
      return NextResponse.json({ id: categoryId, selected: false })
    }

    const count = await prisma.userCategory.count({ where: { userId } })
    if (count >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 categories allowed" },
        { status: 400 }
      )
    }

    await prisma.userCategory.create({ data: { userId, categoryId } })

    // Fire-and-forget: ensure words exist for this category and user
    ensureWordsForUser(userId, categoryId).catch((err) =>
      console.error("ensureWordsForUser failed:", err)
    )

    return NextResponse.json({ id: categoryId, selected: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
