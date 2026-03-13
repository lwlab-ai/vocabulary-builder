"use client"

interface WordCardProps {
  word: string
  pronunciation: string
  explanation: string
  exampleUsage: string
  categoryName: string
}

export default function WordCard({
  word,
  pronunciation,
  explanation,
  exampleUsage,
  categoryName,
}: WordCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
          {categoryName}
        </span>
      </div>

      {/* Word */}
      <h1 className="text-4xl font-bold text-neutral-900 mb-1">{word}</h1>

      {/* Pronunciation */}
      <p className="text-base italic text-neutral-400 mb-6">{pronunciation}</p>

      {/* Definition */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
          Definition
        </p>
        <p className="text-neutral-700 text-base leading-relaxed">{explanation}</p>
      </div>

      {/* Example Usage */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
          Example
        </p>
        <blockquote className="border-l-4 border-indigo-200 pl-4 text-neutral-600 text-base italic leading-relaxed">
          {exampleUsage}
        </blockquote>
      </div>
    </div>
  )
}
