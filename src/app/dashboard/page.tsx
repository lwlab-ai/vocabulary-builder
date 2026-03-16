"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import WordCard from "@/components/WordCard"
import ShuffleButton from "@/components/ShuffleButton"

interface WordData {
  id: number
  wordId: number
  word: string
  definition: string
  pronunciation: string
  exampleUsage: string
  categoryName: string
}

export default function DashboardPage() {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isShuffling, setIsShuffling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const fetchRandomWord = useCallback(async () => {
    const res = await fetch("/api/words/random")
    if (res.status === 404) return null
    if (!res.ok) throw new Error("Failed to fetch word")
    return res.json() as Promise<WordData>
  }, [])

  useEffect(() => {
    fetchRandomWord()
      .then((word) => {
        setCurrentWord(word)
        setError(null)
      })
      .catch(() => setError("Something went wrong. Please refresh."))
      .finally(() => setIsLoading(false))
  }, [fetchRandomWord])

  const handleShuffle = useCallback(async () => {
    if (isShuffling || isLoading) return

    setIsShuffling(true)

    // Fade out
    setVisible(false)

    try {
      // Mark current word as seen
      if (currentWord) {
        await fetch(`/api/words/${currentWord.id}/seen`, { method: "PATCH" })
      }

      // Small delay for fade animation
      await new Promise((resolve) => setTimeout(resolve, 200))

      const next = await fetchRandomWord()
      setCurrentWord(next)
      setError(null)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsShuffling(false)
      setVisible(true)
    }
  }, [currentWord, fetchRandomWord, isLoading, isShuffling])

  // Keyboard shortcut: Space or Right Arrow
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault()
        handleShuffle()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleShuffle])

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-12">
      {isLoading ? (
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 animate-pulse">
          <div className="h-5 w-24 bg-neutral-200 rounded-full mb-4" />
          <div className="h-10 w-48 bg-neutral-200 rounded mb-2" />
          <div className="h-4 w-32 bg-neutral-100 rounded mb-6" />
          <div className="h-3 w-20 bg-neutral-100 rounded mb-2" />
          <div className="h-4 w-full bg-neutral-100 rounded mb-1" />
          <div className="h-4 w-3/4 bg-neutral-100 rounded mb-6" />
          <div className="h-3 w-20 bg-neutral-100 rounded mb-2" />
          <div className="h-4 w-full bg-neutral-100 rounded" />
          <div className="h-4 w-5/6 bg-neutral-100 rounded mt-1" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : currentWord === null ? (
        // Empty state
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            No vocabulary words yet!
          </h2>
          <p className="text-neutral-500 mb-6">
            Start by adding some categories to build your word pool.
          </p>
          <Link
            href="/categories"
            className="inline-block px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Categories
          </Link>
        </div>
      ) : (
        <>
          {/* Word card with fade transition */}
          <div
            className="w-full max-w-xl transition-opacity duration-200"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <WordCard
              word={currentWord.word}
              pronunciation={currentWord.pronunciation}
              explanation={currentWord.definition}
              exampleUsage={currentWord.exampleUsage}
              categoryName={currentWord.categoryName}
            />
          </div>

          {/* Shuffle button */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <ShuffleButton onClick={handleShuffle} isLoading={isShuffling} />
            <p className="text-xs text-neutral-400">or press Space / →</p>
          </div>
        </>
      )}
    </main>
  )
}
