import { prisma } from "./prisma"
import { assignNextWord } from "./wordGenerator"

export async function getRandomUnseen(userId: string) {
    let unseenWord = await findRandomUnseen(userId)

    if (!unseenWord) {
        await assignNextWord(userId)
        unseenWord = await findRandomUnseen(userId)
    }

    return unseenWord
}

async function findRandomUnseen(userId: string) {
    const count = await prisma.userWord.count({
      where: { userId, seen: false },
    })
    if (count === 0) return null
  
    const skip = count <= 1 ? 0 : Math.floor(Math.random() * count)
  
    return prisma.userWord.findFirst({
      where: { userId, seen: false },
      include: {
        word: {
          include: { category: true },
        },
      },
      orderBy: { id: "asc" },
      skip,
    })
  }