"use client"

import { useState, useCallback } from "react"

interface WordCardProps {
  word: string
  pronunciation: string
  explanation: string
  exampleUsage: string
  categoryName: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="text-neutral-300 hover:text-indigo-500 transition-colors shrink-0"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
          <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
        </svg>
      )}
    </button>
  )
}

export default function WordCard({
  word,
  pronunciation,
  explanation,
  exampleUsage,
  categoryName,
}: WordCardProps) {
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
      {/* Category badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
          {categoryName}
        </span>
      </div>

      {/* Word */}
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-4xl font-bold text-neutral-900">{word}</h1>
        <button
          onClick={speak}
          aria-label="Pronounce word"
          className="text-neutral-400 hover:text-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
        <CopyButton text={word} />
      </div>

      {/* Pronunciation */}
      <p className="text-base italic text-neutral-400 mb-6">{pronunciation}</p>

      {/* Definition */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Definition
          </p>
          <CopyButton text={explanation} />
        </div>
        <p className="text-neutral-700 text-base leading-relaxed">{explanation}</p>
      </div>

      {/* Example Usage */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Example
          </p>
          <CopyButton text={exampleUsage} />
        </div>
        <blockquote className="border-l-4 border-indigo-200 pl-4 text-neutral-600 text-base italic leading-relaxed">
          {exampleUsage}
        </blockquote>
      </div>
    </div>
  )
}
