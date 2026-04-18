"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CreditTx {
  id: string
  amount: number
  reason: string
  createdAt: string
}

const CREDIT_RATES = [
  { condition: "Brand New",    icon: "diamond",            credits: 450, cls: "text-primary" },
  { condition: "Lightly Worn", icon: "sentiment_satisfied", credits: 300, cls: "text-secondary" },
  { condition: "Well-Loved",   icon: "favorite",            credits: 150, cls: "text-tertiary" },
]

export default function CreditsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<CreditTx[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetch("/api/credits")
      .then(r => r.json())
      .then(d => { setBalance(d.balance ?? 0); setTransactions(d.transactions ?? []) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status, router])

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>account_balance_wallet</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">SS Points</h1>
        </div>
        <div className="w-10" />
      </header>

      {/* Balance hero */}
      <div className="gradient-primary px-6 pt-8 pb-10 relative overflow-hidden text-center">
        <div className="sticker inline-block mb-3">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full">Verified Holder</span>
        </div>
        <p className="font-manrope text-white/75 text-sm mb-1">Available Credits</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="material-icons text-white" style={{ fontSize: 28 }}>confirmation_number</span>
          <p className="font-jakarta font-extrabold text-6xl text-white">{balance.toLocaleString()}</p>
        </div>
        <p className="font-manrope text-white/60 text-xs">SS Points</p>

        <div className="flex gap-3 justify-center mt-5">
          <Link href="/sell?type=PAIR"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary font-jakarta font-bold text-sm shadow-ambient">
            <span className="material-icons" style={{ fontSize: 16 }}>add</span>
            Get More
          </Link>
          <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/20 text-white font-jakarta font-bold text-sm">
            <span className="material-icons" style={{ fontSize: 16 }}>card_gift_card</span>
            Send Gift
          </button>
        </div>

        <div
          className="absolute right-[-30px] bottom-[-20px] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-4">

        {/* Pay-it-forward system */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-float">
          <h2 className="font-jakarta font-extrabold text-base text-on-surface mb-1">Pay-it-forward System</h2>
          <p className="font-manrope text-xs text-on-surface-variant mb-4 leading-relaxed">
            List your kids' old kicks to earn SS Points. Use those points to trade for new drops — no cash needed.
          </p>
          <div className="space-y-2">
            {CREDIT_RATES.map((r) => (
              <div key={r.condition} className="flex items-center gap-3 bg-surface-low rounded-3xl p-3">
                <div className="w-9 h-9 rounded-2xl bg-surface-highest flex items-center justify-center flex-shrink-0">
                  <span className={`material-icons ${r.cls}`} style={{ fontSize: 18 }}>{r.icon}</span>
                </div>
                <p className="font-jakarta font-bold text-sm text-on-surface flex-1">{r.condition}</p>
                <span className={`font-jakarta font-extrabold text-sm ${r.cls}`}>+{r.credits}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div>
          <p className="font-jakarta font-bold text-sm text-on-surface-variant mb-3">Credit Activity</p>
          {transactions.length === 0 ? (
            <div className="bg-surface-lowest rounded-4xl p-8 text-center shadow-ambient">
              <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>receipt_long</span>
              <p className="font-jakarta font-bold text-on-surface mt-2">No activity yet</p>
              <p className="font-manrope text-xs text-on-surface-variant mt-1">List a shoe to earn your first credits.</p>
              <Link href="/sell?type=PAIR"
                className="mt-3 inline-block px-5 py-2 rounded-full gradient-primary text-white font-jakarta font-bold text-sm shadow-pink-glow">
                Post a Drop
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-surface-lowest rounded-4xl p-4 shadow-ambient flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-secondary/10" : "bg-primary/10"}`}>
                    <span className={`material-icons ${tx.amount > 0 ? "text-secondary" : "text-primary"}`} style={{ fontSize: 20 }}>
                      {tx.amount > 0 ? "add_circle" : "remove_circle"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-bold text-sm text-on-surface truncate">{tx.reason}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-jakarta font-extrabold text-sm ${tx.amount > 0 ? "text-secondary" : "text-primary"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Taglines */}
        <div className="flex gap-2 flex-wrap pb-2">
          {["Cop it.", "Rare Drop.", "Trade Life."].map((t) => (
            <span key={t} className="font-jakarta font-extrabold text-xs gradient-primary-text">{t}</span>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>home</span>
          <span className="label-md">Home</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>search</span>
          <span className="label-md">Search</span>
        </Link>
        <Link href="/sell?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>add_circle</span>
          <span className="label-md">Post</span>
        </Link>
        <Link href="/credits" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>confirmation_number</span>
          <span className="label-md text-primary">Credits</span>
        </Link>
      </nav>
    </div>
  )
}
