"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import Logo from "./Logo"

export default function Nav() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b border-neutral-200 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-bold text-neutral-900">
          <Logo variant="sm" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/categories" className="text-neutral-600 hover:text-neutral-900 transition-colors">
            Categories
          </Link>
          <Link href="/dashboard/settings" className="text-neutral-600 hover:text-neutral-900 transition-colors">
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
