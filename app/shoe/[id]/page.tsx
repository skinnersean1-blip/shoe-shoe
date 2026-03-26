"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Shoe {
  id: string
  type: string
  brand: string
  year: number
  color: string
  size: string
  condition: string
  description: string
  price: number
  images: string
  status: string
  seller: { id: string; name: string | null; email: string | null }
}

const CONDITION_LABEL: Record<string, { label: string; icon: string }> = {
  NEW:      { label: "Deadstock",    icon: "diamond" },
  LIKE_NEW: { label: "VNDS",         icon: "sentiment_satisfied" },
  GOOD:     { label: "Lightly Used", icon: "favorite" },
  FAIR:     { label: "Well-Loved",   icon: "recycling" },
  WORN:     { label: "Heavy Wear",   icon: "auto_fix_off" },
}

export default function ShoePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [shoe, setShoe] = useState<Shoe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showBuySheet, setShowBuySheet] = useState(false)
  const [offerPrice, setOfferPrice] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    fetch(`/api/shoes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setShoe(data)
        setOfferPrice(data.price?.toString() ?? "")
      })
      .catch(() => setError("Failed to load this drop"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  const handleSubmitOffer = async () => {
    if (!shoe) return
    setSubmitError("")
    setIsSubmitting(true)

    if (!session && (!buyerName || !buyerEmail)) {
      setSubmitError("Please provide your name and email to continue as guest.")
      setIsSubmitting(false)
      return
    }

    const offer = parseFloat(offerPrice)
    if (isNaN(offer) || offer <= 0) {
      setSubmitError("Please enter a valid price.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shoeId: shoe.id,
          offerPrice: offer !== shoe.price ? offer : undefined,
          buyerName: !session ? buyerName : undefined,
          buyerEmail: !session ? buyerEmail : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to submit")
      }
      const tx = await res.json()
      router.push(`/transaction/${tx.id}`)
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !shoe) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-5xl bg-surface-low flex items-center justify-center">
          <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>search_off</span>
        </div>
        <p className="font-jakarta font-bold text-xl text-on-surface">Drop not found</p>
        <Link href="/" className="px-6 py-3 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow">
          Back to Drops
        </Link>
      </div>
    )
  }

  const images: string[] = (() => { try { return JSON.parse(shoe.images) } catch { return [] } })()
  const condInfo = CONDITION_LABEL[shoe.condition] ?? { label: shoe.condition, icon: "label" }
  const isSeller = session?.user?.id === shoe.seller.id
  const isAvailable = shoe.status === "AVAILABLE"

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href={`/buy?type=${shoe.type}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low"
        >
          <span className={`material-icons ${isFavorited ? "text-primary" : "text-on-surface-variant"}`} style={{ fontSize: 22 }}>
            {isFavorited ? "favorite" : "favorite_border"}
          </span>
        </button>
      </header>

      {/* ── Image Gallery ── */}
      <div className="relative bg-surface-low aspect-square overflow-hidden">
        {images[currentImageIndex] ? (
          <img
            src={images[currentImageIndex]}
            alt={shoe.brand}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons text-outline-variant" style={{ fontSize: 80 }}>image</span>
          </div>
        )}

        {/* Condition badge overlapping image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
          <span className="flex items-center gap-1.5 bg-surface-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-float">
            <span className="material-icons text-secondary" style={{ fontSize: 14 }}>verified</span>
            <span className="font-jakarta font-bold text-xs text-on-surface">CERTIFIED {shoe.type}</span>
          </span>
          {images.length > 1 && (
            <div className="flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden transition-all ${
                i === currentImageIndex ? "ring-2 ring-primary" : "opacity-60"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Details ── */}
      <div className="px-4 pt-4 space-y-4">

        {/* Title + price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="label-md text-on-surface-variant mb-1">Limited Drop / Kids Series</p>
              <h1 className="font-jakarta font-extrabold text-2xl text-on-surface leading-tight">{shoe.brand}</h1>
              <p className="font-manrope text-sm text-on-surface-variant mt-1">{shoe.color} · Size {shoe.size} · {shoe.year}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-jakarta font-extrabold text-2xl text-primary">${shoe.price.toFixed(2)}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <span className="material-icons text-tertiary" style={{ fontSize: 14 }}>swap_horiz</span>
                <span className="font-manrope text-xs text-on-surface-variant">Open for Trade</span>
              </div>
            </div>
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mt-2">
            <span className="material-icons text-tertiary" style={{ fontSize: 16 }}>star</span>
            <span className="font-jakarta font-bold text-sm text-on-surface">4.9</span>
            <span className="font-manrope text-xs text-on-surface-variant">(124 reviews)</span>
          </div>
        </div>

        {/* Condition chip */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-surface-low px-3 py-1.5 rounded-full">
            <span className="material-icons text-primary" style={{ fontSize: 14 }}>{condInfo.icon}</span>
            <span className="label-md text-on-surface">{condInfo.label}</span>
          </span>
        </div>

        {/* Description */}
        <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
          <p className="font-manrope text-sm text-on-surface leading-relaxed">{shoe.description}</p>
        </div>

        {/* Seller */}
        <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="material-icons text-white" style={{ fontSize: 18 }}>person</span>
            </div>
            <div>
              <p className="font-jakarta font-bold text-sm text-on-surface">
                {shoe.seller.name ?? shoe.seller.email ?? "Seller"}
              </p>
              <p className="font-manrope text-xs text-on-surface-variant">Verified Seller</p>
            </div>
          </div>
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>arrow_forward_ios</span>
        </div>

        {/* More drops */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-jakarta font-bold text-base text-on-surface">More Drops</h2>
            <Link href={`/buy?type=${shoe.type}`} className="flex items-center gap-1 text-primary font-jakarta font-semibold text-sm">
              VIEW ALL <span className="material-icons" style={{ fontSize: 16 }}>east</span>
            </Link>
          </div>
          <p className="font-manrope text-xs text-on-surface-variant">Browse more {shoe.type === "PAIR" ? "paired" : "single"} shoes →</p>
        </div>
      </div>

      {/* ── Bottom CTAs ── */}
      {isAvailable && !isSeller && (
        <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-3 space-y-2 z-50">
          <div className="flex gap-2">
            <button
              onClick={() => setShowBuySheet(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>shopping_bag</span>
              BUY FOR ${shoe.price.toFixed(2)}
            </button>
            <button
              onClick={() => setShowBuySheet(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-surface-highest text-on-surface font-jakarta font-bold"
            >
              <span className="material-icons" style={{ fontSize: 18 }}>swap_horiz</span>
              TRADE FOR 1 CREDIT
            </button>
          </div>
          <p className="text-center font-manrope text-xs text-on-surface-variant">
            No credits? Trade in your old pairs to earn 1 credit
          </p>
        </div>
      )}

      {shoe.status !== "AVAILABLE" && (
        <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-4 z-50">
          <div className="w-full py-3.5 rounded-full bg-surface-highest text-center font-jakarta font-bold text-on-surface-variant">
            {shoe.status === "SOLD" ? "Sold Out" : "Pending Sale"}
          </div>
        </div>
      )}

      {isSeller && (
        <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-4 z-50">
          <div className="w-full py-3.5 rounded-full bg-surface-low text-center font-jakarta font-bold text-on-surface">
            Your Listing
          </div>
        </div>
      )}

      {/* ── Buy Bottom Sheet ── */}
      {showBuySheet && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowBuySheet(false)} />
          <div className="relative bg-surface-lowest rounded-t-5xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-surface-highest rounded-full mx-auto mb-6" />
            <h2 className="font-jakarta font-extrabold text-xl text-on-surface mb-5">Complete Purchase</h2>

            {!session && (
              <div className="space-y-3 mb-5">
                <p className="font-manrope text-sm text-on-surface-variant">
                  Continue as guest or{" "}
                  <Link href="/auth/signin" className="text-primary font-semibold">sign in</Link>
                </p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none"
                />
              </div>
            )}

            <div className="mb-5">
              <label className="label-md text-on-surface-variant mb-2 block">Your offer</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jakarta font-bold text-on-surface-variant">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-surface-low rounded-2xl font-manrope text-sm text-on-surface ghost-border focus:outline-none"
                />
              </div>
              {parseFloat(offerPrice) !== shoe.price && offerPrice && (
                <p className="font-manrope text-xs text-tertiary mt-1">You're making a counteroffer — seller will be notified.</p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-surface-low rounded-3xl p-4 mb-5 space-y-2">
              <div className="flex justify-between font-manrope text-sm">
                <span className="text-on-surface-variant">Offer</span>
                <span className="font-semibold text-on-surface">${(parseFloat(offerPrice) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-manrope text-sm">
                <span className="text-on-surface-variant">Service fee</span>
                <span className="font-semibold text-on-surface">$0.99</span>
              </div>
              <div className="flex justify-between font-jakarta font-bold text-base pt-2 border-t border-surface-high">
                <span>Total</span>
                <span className="text-primary">${((parseFloat(offerPrice) || 0) + 0.99).toFixed(2)}</span>
              </div>
            </div>

            {submitError && (
              <p className="font-manrope text-sm text-primary mb-3">{submitError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuySheet(false)}
                className="flex-1 py-3.5 rounded-full bg-surface-highest text-on-surface font-jakarta font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
