"use client"

import { useEffect, useState, useCallback } from "react"
import { registerAndSubscribe } from "@/lib/push-client"

type NotificationPref = "OFF" | "DAILY" | "HOURLY"
type Invite = { id: number; email: string; createdAt: string }
type SignedUpFriend = { id: string; email: string; createdAt: string }

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

  const [invites, setInvites] = useState<Invite[]>([])
  const [signedUpFriends, setSignedUpFriends] = useState<SignedUpFriend[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const fetchInvites = useCallback(() => {
    fetch("/api/invites")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        if (data?.pending) setInvites(data.pending)
        if (data?.signedUp) setSignedUpFriends(data.signedUp)
      })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchInvites() }, [fetchInvites])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteMessage(null)

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteMessage({ text: data.error || "Failed to send invite", type: "error" })
      } else {
        setInviteEmail("")
        setInviteMessage({ text: `Invited ${data.email}`, type: "success" })
        fetchInvites()
      }
    } catch {
      setInviteMessage({ text: "Something went wrong", type: "error" })
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemoveInvite(id: number) {
    await fetch("/api/invites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchInvites()
  }

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

      {/* Invite Friends */}
      <div className="mt-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
          Invite Friends
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Add a friend&apos;s email so they can sign up
        </p>

        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="friend@example.com"
            required
            className="flex-1 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={inviteLoading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {inviteLoading ? "Inviting..." : "Invite"}
          </button>
        </form>

        {inviteMessage && (
          <p
            className={`mb-4 text-sm ${
              inviteMessage.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {inviteMessage.text}
          </p>
        )}

        {signedUpFriends.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
              Joined
            </p>
            {signedUpFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500 shrink-0">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{friend.email}</span>
              </div>
            ))}
          </div>
        )}

        {invites.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
              Pending Invites
            </p>
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {invite.email}
                </span>
                <button
                  onClick={() => handleRemoveInvite(invite.id)}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove invite for ${invite.email}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
