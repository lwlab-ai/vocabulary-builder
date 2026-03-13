import { prisma } from "@/lib/prisma"
import { generateWords } from "@/lib/claude"

async function generateWordsForCategory(categoryId: number): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) throw new Error(`Category ${categoryId} not found`)

  const existingWords = await prisma.word.findMany({ where: { categoryId }, select: { word: true } })
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

/**
 * Pre-generates a large pool of words for a category.
 * Run this via `scripts/seed-words.ts` to populate the pool ahead of time.
 */
export async function preGenerateWordsForCategory(
  categoryId: number,
  targetCount = 100
): Promise<void> {
  const existing = await prisma.word.count({ where: { categoryId } })
  const needed = targetCount - existing
  if (needed <= 0) return

  const batchSize = 20
  const batches = Math.ceil(needed / batchSize)
  for (let i = 0; i < batches; i++) {
    await generateWordsForCategory(categoryId)
  }
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
      // First, link any pool words not yet assigned to this user (no Claude call needed)
      const unlinkedWords = await prisma.word.findMany({
        where: {
          categoryId: uc.categoryId,
          userWords: { none: { userId } },
        },
      })

      if (unlinkedWords.length > 0) {
        await prisma.userWord.createMany({
          data: unlinkedWords.map((w) => ({ userId, wordId: w.id })),
          skipDuplicates: true,
        })
      } else {
        // Pool exhausted – generate on the fly as a fallback
        await generateWordsForCategory(uc.categoryId)

        const newWords = await prisma.word.findMany({
          where: {
            categoryId: uc.categoryId,
            userWords: { none: { userId } },
          },
        })
        if (newWords.length > 0) {
          await prisma.userWord.createMany({
            data: newWords.map((w) => ({ userId, wordId: w.id })),
            skipDuplicates: true,
          })
        }
      }
    }
  }
}
