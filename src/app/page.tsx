import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">
          Welcome to Vocabulary Builder
        </h1>
        <p className="text-neutral-500 text-base mb-6">
          Learn new vocabulary words one at a time, delivered straight to you.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-neutral-900 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
