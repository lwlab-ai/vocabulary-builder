"use client"

interface ShuffleButtonProps {
  onClick: () => void
  isLoading: boolean
}

export default function ShuffleButton({ onClick, isLoading }: ShuffleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      aria-label="Shuffle to next word"
      className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <span aria-hidden="true">→</span>
      )}
      Shuffle Next Word
    </button>
  )
}
