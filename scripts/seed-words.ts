/**
 * On-demand script to pre-generate a large pool of words for categories.
 *
 * Usage:
 *   npx ts-node scripts/seed-words.ts           # seed all categories
 *   npx ts-node scripts/seed-words.ts <id>      # seed a specific category by ID
 *   npx ts-node scripts/seed-words.ts <id> 200  # seed with a custom target count
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { generateWords } from "../src/lib/claude"

const prisma = new PrismaClient()

async function generateWordsForCategory(categoryId: number, size: number = 20): Promise<void> {
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
    } catch (e: any) {
      if (e.code === "P2002") continue
      throw e
    }
  }
}

const CONCURRENCY = 5

async function seedCategory(categoryId: number, targetCount: number, batchSize: number = 20): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    console.error(`Category ${categoryId} not found`)
    return
  }

  const existing = await prisma.word.count({ where: { categoryId } })
  console.log(`[${category.name}] Pool has ${existing} words, target: ${targetCount}`)

  const totalBatches = Math.ceil(Math.max(0, targetCount - existing) / batchSize)
  let completed = 0

  for (let i = 0; i < totalBatches; i += CONCURRENCY) {
    const chunk = Math.min(CONCURRENCY, totalBatches - i)
    await Promise.all(
      Array.from({ length: chunk }, () =>
        generateWordsForCategory(categoryId, batchSize).then(() => {
          completed++
          process.stdout.write(`  [${category.name}] batch ${completed}/${totalBatches} done\n`)
        })
      )
    )
  }

  const finalCount = await prisma.word.count({ where: { categoryId } })
  console.log(`[${category.name}] Done. ${finalCount} words total.`)
}

async function main() {
  const [, , categoryArg, countArg] = process.argv
  const targetCount = countArg ? parseInt(countArg) : 100

  if (!categoryArg || categoryArg.toLowerCase() === "all") {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
    for (let i = 0; i < categories.length; i += CONCURRENCY) {
      await Promise.all(
        categories.slice(i, i + CONCURRENCY).map((cat) => seedCategory(cat.id, targetCount))
      )
    }
  } else {
    const categoryId = parseInt(categoryArg)
    if (isNaN(categoryId)) {
      console.error("Usage: npm run seed-words -- [all|categoryId] [targetCount]")
      process.exit(1)
    }
    await seedCategory(categoryId, targetCount)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  prisma.$disconnect()
  process.exit(1)
})
