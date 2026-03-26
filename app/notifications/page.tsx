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

const NOTIF_ICON: Record<string, string> = {
  SALE_INITIATED:        "shopping_bag",
  COUNTEROFFER_RECEIVED: "swap_horiz",
  OFFER_ACCEPTED:        "check_circle",
  PAYMENT_RECEIVED:      "payments",
  LABEL_READY:           "label",
  SHIPMENT_CONFIRMED:    "local_shipping",
  DELIVERY_CONFIRMED:    "inventory_2",
  RATING_RECEIVED:       "star",
  TRADE_OFFER_RECEIVED:  "swap_horiz",
  TRADE_COMPLETED:       "check_circle",
  NEW_DROP:              "local_fire_department",
  MODERATION_APPROVED:   "verified",
  MODERATION_FLAGGED:    "warning",
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [status, router])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => {})
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read)
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })))
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>notifications</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Activity Feed</h1>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full gradient-primary text-white label-md flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 ? (
          <button onClick={markAllRead} className="label-md text-primary font-jakarta font-semibold">
            All read
          </button>
        ) : (
          <div className="w-16" />
        )}
      </header>

      <div className="px-4 pt-4">
        <p className="font-jakarta font-bold text-sm text-on-surface-variant mb-4">What's Happening</p>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-5xl bg-surface-low flex items-center justify-center">
              <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>notifications_none</span>
            </div>
            <p className="font-jakarta font-bold text-lg text-on-surface">All caught up!</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">
              No new drops, trades, or alerts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const icon = NOTIF_ICON[n.type] ?? "notifications"
              return (
                <div
                  key={n.id}
                  className={`rounded-4xl p-4 shadow-ambient transition-all ${
                    n.read ? "bg-surface-lowest" : "bg-surface-lowest ring-2 ring-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                      n.read ? "bg-surface-low" : "gradient-primary"
                    }`}>
                      <span className={`material-icons ${n.read ? "text-on-surface-variant" : "text-white"}`} style={{ fontSize: 18 }}>
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-jakarta font-bold text-sm text-on-surface leading-tight">{n.title}</p>
                        <span className="label-md text-on-surface-variant flex-shrink-0">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-manrope text-xs text-on-surface-variant mt-1 leading-relaxed">{n.message}</p>

                      <div className="flex gap-3 mt-2">
                        {n.transactionId && (
                          <Link
                            href={`/transaction/${n.transactionId}`}
                            className="font-jakarta font-semibold text-xs text-primary flex items-center gap-1"
                          >
                            View Offer <span className="material-icons" style={{ fontSize: 12 }}>arrow_forward</span>
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="font-manrope text-xs text-on-surface-variant"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>local_fire_department</span>
          <span className="label-md">Feed</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>auto_awesome_motion</span>
          <span className="label-md">Drops</span>
        </Link>
        <Link href="/sell?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>payments</span>
          <span className="label-md">Credits</span>
        </Link>
        <Link href="/auth/signin" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>face_5</span>
          <span className="label-md text-primary">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
