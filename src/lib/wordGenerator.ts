import { prisma } from "@/lib/prisma"
import { generateWords } from "@/lib/claude"

export async function generateWordsForCategory(categoryId: number): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) throw new Error(`Category ${categoryId} not found`)

  const existingWords = await prisma.word.findMany({ where: { categoryId } })
  const existingWordStrings = existingWords.map((w) => w.word)

  const generated = await generateWords(category.name, existingWordStrings)

  await prisma.word.createMany({
    data: generated.map((w) => ({
      word: w.word,
      definition: w.definition,
      pronunciation: w.pronunciation,
      exampleUsage: w.exampleUsage,
      categoryId,
    })),
    skipDuplicates: true,
  })
}

export async function ensureWordsForUser(userId: string, categoryId: number): Promise<void> {
  const wordCount = await prisma.word.count({ where: { categoryId } })
  if (wordCount < 20) {
    await generateWordsForCategory(categoryId)
  }

  const allWords = await prisma.word.findMany({ where: { categoryId } })
  if (allWords.length > 0) {
    await prisma.userWord.createMany({
      data: allWords.map((w) => ({ userId, wordId: w.id })),
      skipDuplicates: true,
    })
  }
}

export async function checkAndReplenishWords(userId: string): Promise<void> {
  const userCategories = await prisma.userCategory.findMany({ where: { userId } })

  for (const uc of userCategories) {
    const unseenCount = await prisma.userWord.count({
      where: { userId, word: { categoryId: uc.categoryId }, seen: false },
    })

    if (unseenCount < 5) {
      await generateWordsForCategory(uc.categoryId)

      const allWords = await prisma.word.findMany({ where: { categoryId: uc.categoryId } })
      if (allWords.length > 0) {
        await prisma.userWord.createMany({
          data: allWords.map((w) => ({ userId, wordId: w.id })),
          skipDuplicates: true,
        })
      }
    }
  }
}
