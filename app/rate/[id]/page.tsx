"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Transaction {
  id: string
  status: string
  seller: { id: string; name: string | null; email: string | null }
  shoe: { brand: string }
}

const LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent!"]
const LABEL_CLS = ["", "text-primary", "text-tertiary", "text-on-surface-variant", "text-secondary", "text-secondary"]

export default function RatePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/transactions/${params.id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.status !== "DELIVERED" && data.status !== "COMPLETED") setError("Transaction must be delivered first")
        setTransaction(data)
      } catch { setError("Failed to load transaction") }
      finally { setIsLoading(false) }
    }
    load()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: params.id, rating, comment: comment || undefined }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      router.push(`/transaction/${params.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit rating")
    } finally { setIsSubmitting(false) }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  if (!transaction && error) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
      <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>error_outline</span>
      <p className="font-jakarta font-bold text-on-surface">{error}</p>
      <Link href="/" className="px-5 py-2.5 rounded-full gradient-primary text-white font-jakarta font-bold text-sm shadow-pink-glow">
        Go Home
      </Link>
    </div>
  )

  if (!transaction) return null

  const sellerName = transaction.seller.name ?? transaction.seller.email ?? "the seller"
  const displayRating = hovered || rating

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center gap-3">
        <Link href={`/transaction/${params.id}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Rate Your Trade</h1>
          <p className="font-manrope text-xs text-on-surface-variant">How did it go?</p>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-primary px-6 pt-8 pb-10 relative overflow-hidden text-center">
        <div className="sticker inline-block mb-3">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full">Trade Complete</span>
        </div>
        <p className="font-jakarta font-extrabold text-2xl text-white mb-1">{transaction.shoe.brand}</p>
        <p className="font-manrope text-sm text-white/70">Sold by {sellerName}</p>
        <div
          className="absolute right-[-30px] bottom-[-20px] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Star rating */}
          <div className="bg-surface-lowest rounded-4xl p-6 shadow-float text-center">
            <p className="font-manrope text-sm text-on-surface-variant mb-4">
              How was your experience with <strong>{sellerName}</strong>?
            </p>
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <span
                    className={`material-icons text-4xl transition-colors ${star <= displayRating ? "text-tertiary" : "text-surface-highest"}`}
                    style={{ fontSize: 40 }}
                  >
                    {star <= displayRating ? "star" : "star_border"}
                  </span>
                </button>
              ))}
            </div>
            <p className={`font-jakarta font-extrabold text-lg transition-colors ${LABEL_CLS[displayRating]}`}>
              {LABEL[displayRating]}
            </p>
          </div>

          {/* Quick tags */}
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <p className="font-jakarta font-bold text-sm text-on-surface mb-3">Quick Tags</p>
            <div className="flex flex-wrap gap-2">
              {["Fast shipper", "Great condition", "Accurate listing", "Easy trade", "Would buy again"].map((tag) => {
                const selected = comment.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setComment(prev =>
                      selected ? prev.replace(tag, "").trim() : [prev, tag].filter(Boolean).join(", ")
                    )}
                    className={`px-3 py-1.5 rounded-full font-jakarta font-semibold text-xs transition-all ${selected ? "gradient-primary text-white shadow-pink-glow" : "bg-surface-high text-on-surface-variant"}`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <p className="font-jakarta font-bold text-sm text-on-surface mb-3">Add a note (optional)</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell the community about this trade…"
              rows={4}
              className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none resize-none"
            />
          </div>

          {error && <p className="font-manrope text-xs text-primary text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold text-base shadow-pink-glow disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit Review ★"}
          </button>
        </form>

        <div className="flex gap-2 flex-wrap pb-2">
          {["Cop it.", "Rare Drop.", "Trade Life."].map((t) => (
            <span key={t} className="font-jakarta font-extrabold text-xs gradient-primary-text">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
