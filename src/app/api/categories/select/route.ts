import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Create UserWord records for all existing words in this category
    const words = await prisma.word.findMany({ where: { categoryId } })
    if (words.length > 0) {
      await prisma.userWord.createMany({
        data: words.map((w) => ({ userId, wordId: w.id })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ id: categoryId, selected: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
