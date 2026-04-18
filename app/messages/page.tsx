"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  createdAt: string
  read: boolean
  sender: { id: string; name: string | null; email: string | null }
  receiver: { id: string; name: string | null; email: string | null }
}

type Tab = "all" | "trades" | "buying" | "selling"

const TAB_LABELS: Record<Tab, string> = {
  all: "All",
  trades: "Trades",
  buying: "Buying",
  selling: "Selling",
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("all")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status, router])

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  const userId = session?.user?.id

  const getOther = (msg: Message) =>
    msg.sender.id === userId ? msg.receiver : msg.sender

  const getInitials = (name: string | null, email: string | null) => {
    const s = name ?? email ?? "?"
    return s.slice(0, 2).toUpperCase()
  }

  const unreadCount = messages.filter(m => !m.read && m.receiver.id === userId).length

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>forum</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Inbox</h1>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full gradient-primary text-white font-jakarta font-bold text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>edit_square</span>
        </button>
      </header>

      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-surface-low rounded-full px-4 py-2.5">
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>search</span>
          <span className="font-manrope text-sm text-on-surface-variant">Search messages…</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex bg-surface-high rounded-full p-1 gap-1">
          {(["all", "trades", "buying", "selling"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full font-jakarta font-semibold text-xs capitalize transition-all ${tab === t ? "gradient-primary text-white shadow-ambient" : "text-on-surface-variant"}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      <div className="px-4 pt-2 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-20 h-20 rounded-5xl bg-surface-low flex items-center justify-center">
              <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>forum</span>
            </div>
            <p className="font-jakarta font-bold text-on-surface">No messages yet</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">
              When you buy or trade, your conversations will appear here.
            </p>
            <Link href="/" className="px-5 py-2.5 rounded-full gradient-primary text-white font-jakarta font-bold text-sm shadow-pink-glow">
              Browse Drops
            </Link>
          </div>
        ) : (
          messages.map((msg) => {
            const other = getOther(msg)
            const isUnread = !msg.read && msg.receiver.id === userId
            return (
              <div key={msg.id}
                className={`bg-surface-lowest rounded-4xl p-4 shadow-ambient flex items-center gap-3 ${isUnread ? "ring-2 ring-primary/30" : ""}`}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <span className="font-jakarta font-extrabold text-base text-white">
                      {getInitials(other.name, other.email)}
                    </span>
                  </div>
                  {isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full gradient-primary border-2 border-surface-lowest" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-jakarta font-bold text-sm text-on-surface truncate ${isUnread ? "font-extrabold" : ""}`}>
                      {other.name ?? other.email ?? "User"}
                    </p>
                    <p className="font-manrope text-xs text-on-surface-variant flex-shrink-0 ml-2">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-manrope text-xs truncate ${isUnread ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                    {msg.sender.id === userId ? "You: " : ""}{msg.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tagline */}
      <div className="px-4 pt-4 flex gap-2">
        {["Cop it.", "Trade Life."].map((t) => (
          <span key={t} className="font-jakarta font-extrabold text-xs gradient-primary-text">{t}</span>
        ))}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>local_fire_department</span>
          <span className="label-md">Feed</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>layers</span>
          <span className="label-md">Drops</span>
        </Link>
        <Link href="/credits" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>confirmation_number</span>
          <span className="label-md">Credits</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>face_5</span>
          <span className="label-md">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
