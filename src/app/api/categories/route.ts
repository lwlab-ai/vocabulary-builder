import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  const [categories, userCategories] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.userCategory.findMany({ where: { userId } }),
  ])

  const selectedIds = new Set(userCategories.map((uc) => uc.categoryId))

  const result = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    selected: selectedIds.has(cat.id),
  }))

  return NextResponse.json(result)
}
