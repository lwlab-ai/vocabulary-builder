/**
 * On-demand script to pre-generate a large pool of words for categories.
 *
 * Usage:
 *   npx ts-node scripts/seed-words.ts           # seed all categories
 *   npx ts-node scripts/seed-words.ts <id>      # seed a specific category by ID
 *   npx ts-node scripts/seed-words.ts <id> 200  # seed with a custom target count
 */

import { PrismaClient } from "@prisma/client"
import { generateWords } from "../src/lib/claude"

const prisma = new PrismaClient()

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

async function seedCategory(categoryId: number, targetCount: number): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    console.error(`Category ${categoryId} not found`)
    return
  }

  const existing = await prisma.word.count({ where: { categoryId } })
  console.log(`[${category.name}] Pool has ${existing} words, target: ${targetCount}`)

  const batches = Math.ceil(Math.max(0, targetCount - existing) / 20)
  for (let i = 0; i < batches; i++) {
    process.stdout.write(`  batch ${i + 1}/${batches}...`)
    await generateWordsForCategory(categoryId)
    const count = await prisma.word.count({ where: { categoryId } })
    console.log(` ${count} words total`)
  }

  console.log(`[${category.name}] Done.`)
}

async function main() {
  const [, , categoryArg, countArg] = process.argv
  const targetCount = countArg ? parseInt(countArg) : 100

  if (categoryArg) {
    const categoryId = parseInt(categoryArg)
    if (isNaN(categoryId)) {
      console.error("Usage: npx ts-node scripts/seed-words.ts [categoryId] [targetCount]")
      process.exit(1)
    }
    await seedCategory(categoryId, targetCount)
  } else {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
    for (const cat of categories) {
      await seedCategory(cat.id, targetCount)
    }
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  prisma.$disconnect()
  process.exit(1)
})
