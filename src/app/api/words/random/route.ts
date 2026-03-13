import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Find a random unseen word from the user's selected categories
  const unseenWord = await prisma.userWord.findFirst({
    where: {
      userId,
      seen: false,
    },
    include: {
      word: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      // Random-ish ordering using id
      id: "asc",
    },
    skip: await getRandomSkip(userId),
  })

  if (!unseenWord) {
    return NextResponse.json({ error: "No words available" }, { status: 404 })
  }

  return NextResponse.json({
    id: unseenWord.id,
    wordId: unseenWord.word.id,
    word: unseenWord.word.word,
    definition: unseenWord.word.definition,
    pronunciation: unseenWord.word.pronunciation,
    exampleUsage: unseenWord.word.exampleUsage,
    categoryName: unseenWord.word.category.name,
    seen: unseenWord.seen,
  })
}

async function getRandomSkip(userId: string): Promise<number> {
  const count = await prisma.userWord.count({
    where: { userId, seen: false },
  })
  if (count <= 1) return 0
  return Math.floor(Math.random() * count)
}
