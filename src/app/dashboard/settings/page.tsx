"use client"

import { useEffect, useState } from "react"
import { registerAndSubscribe } from "@/lib/push-client"

type NotificationPref = "OFF" | "DAILY" | "HOURLY"

const PREF_LABELS: Record<NotificationPref, string> = {
  OFF: "Off",
  DAILY: "Daily (9 AM UTC)",
  HOURLY: "Hourly",
}

export default function SettingsPage() {
  const [preference, setPreference] = useState<NotificationPref>("OFF")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isPushSupported, setIsPushSupported] = useState(true)

  useEffect(() => {
    setIsPushSupported(
      "serviceWorker" in navigator && "PushManager" in window
    )
  }, [])

  useEffect(() => {
    fetch("/api/notifications/preference")
      .then((r) => r.json())
      .then((data) => {
        setPreference(data.preference ?? "OFF")
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSelect(pref: NotificationPref) {
    if (pref === preference) return
    setSaving(true)
    setMessage(null)

    try {
      if (pref !== "OFF") {
        if (!isPushSupported) {
          setMessage({ text: "Push notifications are not supported in your browser", type: "error" })
          return
        }

        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          setMessage({ text: "Notification permission denied", type: "error" })
          return
        }

        // Get VAPID public key
        const vapidRes = await fetch("/api/notifications/vapid-key")
        const { publicKey } = await vapidRes.json()

        // Register service worker and get subscription
        const subscription = await registerAndSubscribe(publicKey)

        // Save subscription
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription }),
        })
      }

      // Update preference
      const res = await fetch("/api/notifications/preference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: pref }),
      })

      if (!res.ok) throw new Error("Failed to update preference")

      setPreference(pref)
      setMessage({
        text: pref === "OFF" ? "Notifications disabled" : `${PREF_LABELS[pref]} notifications enabled`,
        type: "success",
      })
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">Settings</h1>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
          Notification Settings
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Receive push notifications with new vocabulary words
        </p>

        {!isPushSupported && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            Push notifications are not supported in your browser
          </p>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(["OFF", "DAILY", "HOURLY"] as NotificationPref[]).map((pref) => (
              <button
                key={pref}
                onClick={() => handleSelect(pref)}
                disabled={saving}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left ${
                  preference === pref
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                    : "border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-medium">{PREF_LABELS[pref]}</span>
                {preference === pref && (
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </main>
  )
}
