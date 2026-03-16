import { prisma } from "@/lib/prisma"
import { generateWords } from "@/lib/claude"

async function generateWordsForCategory(categoryId: number, size: number = 2): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) throw new Error(`Category ${categoryId} not found`)

  const generated = await generateWords(category.name, size)

  const existingWords = new Set(
    (await prisma.word.findMany({ where: { categoryId }, select: { word: true } }))
      .map((w) => w.word.toLowerCase())
  )
  const newWords = generated.filter((w) => !existingWords.has(w.word.toLowerCase()))

  for (const w of newWords) {
    try {
      await prisma.word.create({
        data: {
          word: w.word,
          definition: w.definition,
          pronunciation: w.pronunciation,
          exampleUsage: w.exampleUsage,
          categoryId,
        },
      })
    } catch (e) {
      if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") continue
      throw e
    }
  }
}

export async function ensureWordsForUser(userId: string, categoryId: number): Promise<void> {
  const wordCount = await prisma.word.count({ where: { categoryId } })
  if (wordCount === 0) {
    await generateWordsForCategory(categoryId)
  }

  const unlinkedWord = await prisma.word.findFirst({
    where: {
      categoryId,
      userWords: { none: { userId } },
    },
  })
  if (unlinkedWord) {
    await prisma.userWord.create({
      data: { userId, wordId: unlinkedWord.id },
    })
  }
}

export async function assignNextWord(userId: string): Promise<void> {
  const userCategories = await prisma.userCategory.findMany({ where: { userId } })
  if (userCategories.length === 0) return

  const categoryIds = userCategories.map((uc) => uc.categoryId)

  // Try to find an unlinked pool word across ALL user categories
  const unlinkedWord = await prisma.word.findFirst({
    where: {
      categoryId: { in: categoryIds },
      userWords: { none: { userId } },
    },
  })

  if (unlinkedWord) {
    await prisma.userWord.create({
      data: { userId, wordId: unlinkedWord.id },
    })
    return
  }

  // All categories exhausted -- generate a small batch for a random category
  const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)]
  await generateWordsForCategory(randomCategory)

  const newWord = await prisma.word.findFirst({
    where: {
      categoryId: { in: categoryIds },
      userWords: { none: { userId } },
    },
  })

  if (newWord) {
    await prisma.userWord.create({
      data: { userId, wordId: newWord.id },
    })
  }
}
