"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Shoe {
  id: string
  brand: string
  size: string
  condition: string
  price: number
  images: string
  moderationStatus: string
  listingType: string
  createdAt: string
  seller: { id: string; name: string | null; email: string | null }
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Brand New", LIKE_NEW: "VNDS", GOOD: "Lightly Used", FAIR: "Well-Loved", WORN: "Heavy Wear",
}

export default function ModerationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [queue, setQueue] = useState<Shoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const fetchQueue = () => {
    setIsLoading(true)
    fetch("/api/admin/shoes?moderationStatus=PENDING_REVIEW")
      .then(r => r.json())
      .then(d => setQueue(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetchQueue()
  }, [status, router])

  const act = async (shoeId: string, action: "approve" | "flag" | "reject") => {
    setActing(shoeId)
    await fetch("/api/admin/shoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shoeId, action }),
    }).catch(() => {})
    setActing(null)
    fetchQueue()
  }

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pb-24">

      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>pending_actions</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Review Queue</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
          <span className="font-jakarta font-extrabold text-sm text-tertiary">{queue.length}</span>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-20 h-20 rounded-5xl bg-secondary/10 flex items-center justify-center">
              <span className="material-icons text-secondary" style={{ fontSize: 40 }}>verified</span>
            </div>
            <p className="font-jakarta font-bold text-on-surface">Queue is clear!</p>
            <p className="font-manrope text-sm text-on-surface-variant">All listings have been reviewed.</p>
          </div>
        ) : (
          queue.map((shoe) => {
            const img = (() => { try { const a = JSON.parse(shoe.images); return a[0] ?? null } catch { return null } })()
            const sellerName = shoe.seller.name ?? shoe.seller.email ?? "Unknown"
            return (
              <div key={shoe.id} className="bg-surface-lowest rounded-4xl overflow-hidden shadow-float">
                {/* Image + info */}
                <div className="flex">
                  <div className="w-28 h-28 bg-surface-low flex-shrink-0 relative">
                    {img
                      ? <img src={img} alt={shoe.brand} className="w-full h-full object-cover" />
                      : <span className="material-icons text-outline-variant absolute inset-0 m-auto" style={{ fontSize: 36 }}>image</span>
                    }
                    <span className="absolute top-2 left-2 label-md bg-tertiary text-white px-2 py-0.5 rounded-full sticker">
                      {shoe.listingType}
                    </span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <p className="font-jakarta font-extrabold text-base text-on-surface truncate">{shoe.brand}</p>
                    <p className="font-manrope text-xs text-on-surface-variant mb-1">
                      Size {shoe.size} · {CONDITION_LABEL[shoe.condition] ?? shoe.condition}
                    </p>
                    <p className="font-jakarta font-extrabold text-primary text-sm mb-1">${shoe.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-on-surface-variant" style={{ fontSize: 12 }}>person</span>
                      <p className="font-manrope text-xs text-on-surface-variant truncate">{sellerName}</p>
                    </div>
                    <p className="font-manrope text-xs text-on-surface-variant">
                      {new Date(shoe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-3 bg-surface-low">
                  <button
                    onClick={() => act(shoe.id, "approve")}
                    disabled={acting === shoe.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-secondary/10 text-secondary font-jakarta font-bold text-xs disabled:opacity-50"
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>verified</span>
                    Verify & Post
                  </button>
                  <button
                    onClick={() => act(shoe.id, "flag")}
                    disabled={acting === shoe.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-tertiary/10 text-tertiary font-jakarta font-bold text-xs disabled:opacity-50"
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>add_a_photo</span>
                    More Photos
                  </button>
                  <button
                    onClick={() => act(shoe.id, "reject")}
                    disabled={acting === shoe.id}
                    className="flex items-center justify-center py-2.5 px-3 rounded-full bg-primary/10 text-primary font-jakarta font-bold text-xs disabled:opacity-50"
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>flag</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
