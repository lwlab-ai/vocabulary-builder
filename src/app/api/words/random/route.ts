import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRandomUnseen } from "@/lib/user-word"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const unseenWord = await getRandomUnseen(userId)

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