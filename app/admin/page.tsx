"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Stats {
  totalListings: number
  pendingReview: number
  totalTrades: number
  activeUsers: number
  flaggedListings: number
  openDisputes: number
}

const STAT_CARDS = [
  { key: "totalListings",   label: "Active Listings",  icon: "sell",            cls: "text-primary" },
  { key: "pendingReview",   label: "Pending Review",   icon: "pending_actions", cls: "text-tertiary" },
  { key: "totalTrades",     label: "Total Trades",     icon: "swap_horiz",      cls: "text-secondary" },
  { key: "openDisputes",    label: "Open Disputes",    icon: "gavel",           cls: "text-primary" },
]

const NAV_LINKS = [
  { href: "/admin/moderation", icon: "pending_actions", label: "Moderation Queue",  sub: "Review pending listings" },
  { href: "/admin/users",      icon: "group",            label: "User Management",   sub: "Trust scores & balances" },
  { href: "/admin/disputes",   icon: "gavel",            label: "Disputes",          sub: "Active case resolution" },
  { href: "/admin/config",     icon: "tune",             label: "System Config",     sub: "Live ops & fees" },
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ totalListings: 0, pendingReview: 0, totalTrades: 0, activeUsers: 0, flaggedListings: 0, openDisputes: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status, router])

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  const userName = session?.user?.name ?? session?.user?.email ?? "Admin"

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>admin_panel_settings</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Command Center</h1>
        </div>
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <span className="font-jakarta font-extrabold text-sm text-white">{userName.slice(0, 2).toUpperCase()}</span>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-primary px-6 pt-8 pb-10 relative overflow-hidden">
        <div className="sticker inline-block mb-3">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full">Live Ops</span>
        </div>
        <p className="font-jakarta font-extrabold text-2xl text-white mb-1">The Urban Playground</p>
        <p className="font-manrope text-sm text-white/70">Admin dashboard · Real-time overview</p>
        <div
          className="absolute right-[-30px] bottom-[-20px] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-4">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STAT_CARDS.map((card) => (
            <div key={card.key} className="bg-surface-lowest rounded-4xl p-4 shadow-float">
              <span className={`material-icons ${card.cls} mb-2`} style={{ fontSize: 22 }}>{card.icon}</span>
              <p className="font-jakarta font-extrabold text-2xl text-on-surface">
                {(stats as Record<string, number>)[card.key] ?? 0}
              </p>
              <p className="font-manrope text-xs text-on-surface-variant">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(stats.pendingReview > 0 || stats.openDisputes > 0) && (
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-tertiary" style={{ fontSize: 20 }}>notifications_active</span>
              <h2 className="font-jakarta font-bold text-sm text-on-surface">Action Required</h2>
            </div>
            <div className="space-y-2">
              {stats.pendingReview > 0 && (
                <Link href="/admin/moderation"
                  className="flex items-center gap-3 bg-tertiary/10 rounded-3xl p-3">
                  <span className="material-icons text-tertiary" style={{ fontSize: 18 }}>pending_actions</span>
                  <div className="flex-1">
                    <p className="font-jakarta font-bold text-sm text-on-surface">{stats.pendingReview} listings need review</p>
                    <p className="font-manrope text-xs text-on-surface-variant">Tap to open moderation queue</p>
                  </div>
                  <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>chevron_right</span>
                </Link>
              )}
              {stats.openDisputes > 0 && (
                <Link href="/admin/disputes"
                  className="flex items-center gap-3 bg-primary/10 rounded-3xl p-3">
                  <span className="material-icons text-primary" style={{ fontSize: 18 }}>gavel</span>
                  <div className="flex-1">
                    <p className="font-jakarta font-bold text-sm text-on-surface">{stats.openDisputes} open disputes</p>
                    <p className="font-manrope text-xs text-on-surface-variant">Tap to review cases</p>
                  </div>
                  <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>chevron_right</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Nav cards */}
        <div className="space-y-2">
          <p className="font-jakarta font-bold text-sm text-on-surface-variant px-1">Admin Tools</p>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="bg-surface-lowest rounded-4xl p-4 shadow-ambient flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white" style={{ fontSize: 20 }}>{link.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-jakarta font-bold text-sm text-on-surface">{link.label}</p>
                <p className="font-manrope text-xs text-on-surface-variant">{link.sub}</p>
              </div>
              <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
            </Link>
          ))}
        </div>

        {/* Taglines */}
        <div className="flex gap-2 flex-wrap pb-2">
          {["Cop it.", "Rare Drop.", "Trade Life."].map((t) => (
            <span key={t} className="font-jakarta font-extrabold text-xs gradient-primary-text">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
