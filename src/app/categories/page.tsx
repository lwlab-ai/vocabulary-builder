"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Category {
  id: number
  name: string
  slug: string
  selected: boolean
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((data) => {
          setCategories(data)
          setLoading(false)
        })
    }
  }, [status])

  const selectedCount = categories.filter((c) => c.selected).length

  async function toggleCategory(cat: Category) {
    if (!cat.selected && selectedCount >= 10) {
      setAlert("Maximum 10 categories allowed. Deselect one first.")
      setTimeout(() => setAlert(""), 3000)
      return
    }

    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, selected: !c.selected } : c))
    )

    const res = await fetch("/api/categories/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: cat.id }),
    })

    if (!res.ok) {
      // Revert on error
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, selected: cat.selected } : c))
      )
      const data = await res.json()
      if (data.error === "Maximum 10 categories allowed") {
        setAlert("Maximum 10 categories allowed. Deselect one first.")
        setTimeout(() => setAlert(""), 3000)
      }
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Choose Your Categories
          </h1>
          <p className="text-neutral-500 text-base">
            Select up to 10 categories you want to learn vocabulary for
          </p>
          <p className="mt-3 text-sm font-medium text-neutral-700">
            {selectedCount} / 10 selected
          </p>
        </div>

        {alert && (
          <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-800 text-sm rounded-lg px-4 py-3 text-center">
            {alert}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat)}
              className={`relative rounded-xl px-4 py-4 text-sm font-medium text-left transition-all border ${
                cat.selected
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {cat.selected && (
                <span className="absolute top-2 right-2 text-xs">✓</span>
              )}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-neutral-900 text-white rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            Continue to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
