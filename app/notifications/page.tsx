"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  transactionId: string | null
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchNotifications()
    }
  }, [status])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      setError("Failed to load notifications")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition">
          ← Shoe-Shoe
        </Link>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Notifications</h1>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all ${
                    notification.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-purple-50 border-purple-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex gap-3">
                    {notification.transactionId && (
                      <Link
                        href={`/transaction/${notification.transactionId}`}
                        className="text-sm text-purple-600 hover:underline font-semibold"
                      >
                        View Transaction →
                      </Link>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
