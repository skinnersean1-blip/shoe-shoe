"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string | null
  email: string | null
  creditBalance: number
  trustScore: number
  role: string
  createdAt: string
  _count: { shoesListed: number; sales: number }
}

const TRUST_CLS = (score: number) =>
  score >= 4.5 ? "text-secondary" : score >= 3 ? "text-tertiary" : "text-primary"

const TRUST_LABEL = (score: number) =>
  score >= 4.5 ? "Trusted" : score >= 3 ? "Caution" : "At Risk"

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status, router])

  const handleAdjust = async (userId: string) => {
    const amount = parseInt(adjustAmount)
    if (isNaN(amount)) return
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, creditAdjustment: amount }),
    }).catch(() => {})
    setAdjusting(null)
    setAdjustAmount("")
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
  }

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-surface pb-24">

      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>group</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Users</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center">
          <span className="font-jakarta font-extrabold text-sm text-on-surface-variant">{users.length}</span>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-surface-low rounded-full px-4 py-2.5">
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>search</span>
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent font-manrope text-sm text-on-surface focus:outline-none"
          />
        </div>
      </div>

      <div className="px-4 pt-2 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>person_search</span>
            <p className="font-jakarta font-bold text-on-surface">No users found</p>
          </div>
        ) : (
          filtered.map((user) => {
            const name = user.name ?? user.email ?? "Unknown"
            const isAdjusting = adjusting === user.id
            return (
              <div key={user.id} className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="font-jakarta font-extrabold text-sm text-white">{name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-jakarta font-bold text-sm text-on-surface truncate">{name}</p>
                      {user.role !== "USER" && (
                        <span className="label-md gradient-primary text-white px-2 py-0.5 rounded-full sticker">{user.role}</span>
                      )}
                    </div>
                    <p className="font-manrope text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-jakarta font-extrabold text-sm ${TRUST_CLS(user.trustScore)}`}>
                      ★ {user.trustScore.toFixed(1)}
                    </p>
                    <p className={`font-manrope text-xs ${TRUST_CLS(user.trustScore)}`}>{TRUST_LABEL(user.trustScore)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 bg-surface-low rounded-2xl p-2 text-center">
                    <p className="font-jakarta font-extrabold text-sm text-on-surface">{user._count?.shoesListed ?? 0}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">Listings</p>
                  </div>
                  <div className="flex-1 bg-surface-low rounded-2xl p-2 text-center">
                    <p className="font-jakarta font-extrabold text-sm text-on-surface">{user._count?.sales ?? 0}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">Trades</p>
                  </div>
                  <div className="flex-1 bg-surface-low rounded-2xl p-2 text-center">
                    <p className="font-jakarta font-extrabold text-sm text-secondary">{user.creditBalance}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">SS Pts</p>
                  </div>
                </div>

                {/* Credit adjustment */}
                {isAdjusting ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount (±)"
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(e.target.value)}
                      className="flex-1 bg-surface-low rounded-2xl px-3 py-2 font-manrope text-sm text-on-surface ghost-border focus:outline-none"
                    />
                    <button onClick={() => handleAdjust(user.id)}
                      className="px-4 py-2 rounded-full gradient-primary text-white font-jakarta font-bold text-xs shadow-pink-glow">
                      Apply
                    </button>
                    <button onClick={() => { setAdjusting(null); setAdjustAmount("") }}
                      className="px-3 py-2 rounded-full bg-surface-high text-on-surface-variant font-jakarta font-bold text-xs">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAdjusting(user.id)}
                    className="w-full py-2.5 rounded-full bg-surface-high text-on-surface font-jakarta font-semibold text-xs flex items-center justify-center gap-1.5">
                    <span className="material-icons" style={{ fontSize: 14 }}>edit</span>
                    Adjust Credits
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
