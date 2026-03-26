"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

const AGE_TABS = ["Baby (0C–4C)", "Toddler", "Youth"] as const
type AgeTab = typeof AGE_TABS[number]

const SIZE_OPTIONS: Record<AgeTab, string[]> = {
  "Baby (0C–4C)":  ["0C","1C","2C","3C","4C"],
  "Toddler":       ["5C","6C","7C","8C","9C","10C"],
  "Youth":         ["11C","12C","13C","1Y","2Y","3Y","4Y","5Y","6Y","7Y"],
}

const CONDITIONS = [
  {
    key: "NEW",
    label: "Brand New",
    desc: "Never worn, original box included",
    credits: 450,
    icon: "diamond",
  },
  {
    key: "LIKE_NEW",
    label: "Lightly Worn",
    desc: "Worn a few times, still looks fresh",
    credits: 300,
    icon: "sentiment_satisfied",
  },
  {
    key: "GOOD",
    label: "Well-Loved",
    desc: "Heavy wear. Perfect for trade!",
    credits: 150,
    icon: "favorite",
  },
]

const LISTING_TYPES = [
  { key: "sell",   label: "Sell",   icon: "payments" },
  { key: "trade",  label: "Trade",  icon: "swap_horiz" },
  { key: "donate", label: "Donate", icon: "volunteer_activism" },
]

function SellContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const initialType = (searchParams.get("type") ?? "PAIR") as "SINGLE" | "PAIR"

  const [ageTab, setAgeTab] = useState<AgeTab>("Toddler")
  const [formData, setFormData] = useState({
    brand: "",
    color: "",
    year: new Date().getFullYear(),
    size: "",
    condition: "NEW",
    description: "",
    price: "",
    type: initialType,
  })
  const [listingType, setListingType] = useState<"sell" | "trade" | "donate">("sell")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 5 - images.length).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 5))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!session) {
      setError("You must be signed in to post a listing.")
      setIsSubmitting(false)
      router.push("/auth/signin")
      return
    }
    if (images.length === 0) {
      setError("Please upload at least one photo.")
      setIsSubmitting(false)
      return
    }
    if (!formData.size) {
      setError("Please select a size.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/shoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: listingType === "sell" ? parseFloat(formData.price) : 0,
          images: JSON.stringify(images),
          listingType,
        }),
      })
      if (!res.ok) throw new Error("Failed to create listing")
      const data = await res.json()
      router.push(`/shoe/${data.id}`)
    } catch {
      setError("Failed to post listing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCondition = CONDITIONS.find((c) => c.key === formData.condition)

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Post</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pt-6 pb-8">
        {/* ── Hero text ── */}
        <div className="mb-6">
          <h2 className="font-jakarta font-extrabold text-3xl text-on-surface mb-1">
            Fresh Drop! 👟
          </h2>
          <p className="font-manrope text-on-surface-variant text-sm">
            List your kid's kicks for the next generation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Photos ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-3 block">Photos (up to 5)</label>
            <div className="flex gap-3 flex-wrap">
              {/* Upload trigger */}
              {images.length < 5 && (
                <label className="w-24 h-24 rounded-3xl bg-surface-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-high transition">
                  <span className="material-icons text-on-surface-variant" style={{ fontSize: 28 }}>add_a_photo</span>
                  <span className="label-md text-on-surface-variant mt-1">Cover</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-3xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-on-surface/80 text-surface flex items-center justify-center"
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>close</span>
                  </button>
                  {idx > 0 && (
                    <label className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-surface-lowest/80 flex items-center justify-center cursor-pointer">
                      <span className="material-icons" style={{ fontSize: 14 }}>add</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              ))}
              {images.length > 0 && images.length < 5 && (
                <label className="w-24 h-24 rounded-3xl bg-surface-low flex items-center justify-center cursor-pointer hover:bg-surface-high transition">
                  <span className="material-icons text-on-surface-variant" style={{ fontSize: 28 }}>add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* ── Name ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-2 block">What are they called?</label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Air Max 'Bubbles'"
              className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition"
            />
          </div>

          {/* ── Size ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-3 block">Select the size</label>
            {/* Age tabs */}
            <div className="flex gap-2 mb-3">
              {AGE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setAgeTab(tab); setFormData({ ...formData, size: "" }) }}
                  className={`flex-1 py-1.5 rounded-full font-jakarta font-semibold text-xs transition-all ${
                    ageTab === tab
                      ? "gradient-primary text-white"
                      : "bg-surface-low text-on-surface-variant"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Size chips */}
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS[ageTab].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFormData({ ...formData, size: sz })}
                  className={`px-4 py-2 rounded-2xl font-jakarta font-bold text-sm transition-all ${
                    formData.size === sz
                      ? "bg-tertiary-container text-on-surface shadow-ambient"
                      : "bg-surface-high text-on-surface-variant"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* ── Condition ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-3 block">Condition</label>
            <div className="space-y-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: c.key })}
                  className={`w-full flex items-center gap-3 p-3 rounded-3xl transition-all ${
                    formData.condition === c.key
                      ? "bg-surface-low ring-2 ring-primary"
                      : "bg-surface hover:bg-surface-low"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    formData.condition === c.key ? "gradient-primary" : "bg-surface-high"
                  }`}>
                    <span className={`material-icons ${formData.condition === c.key ? "text-white" : "text-on-surface-variant"}`} style={{ fontSize: 20 }}>
                      {c.icon}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-jakarta font-bold text-sm text-on-surface">{c.label}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">{c.desc}</p>
                  </div>
                  <span className="font-jakarta font-extrabold text-sm text-primary">+{c.credits}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Description ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-2 block">
              Tell the story ({formData.description.length}/500)
            </label>
            <textarea
              maxLength={500}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes these kicks special?"
              rows={4}
              className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition resize-none"
            />
          </div>

          {/* ── Listing type ── */}
          <div className="bg-surface-lowest rounded-4xl p-4 shadow-ambient">
            <label className="label-md text-on-surface-variant mb-3 block">What do you want to do?</label>
            <div className="flex gap-2">
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.key}
                  type="button"
                  onClick={() => setListingType(lt.key as typeof listingType)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-3xl font-jakarta font-bold text-xs transition-all ${
                    listingType === lt.key
                      ? "gradient-primary text-white shadow-pink-glow"
                      : "bg-surface-low text-on-surface-variant"
                  }`}
                >
                  <span className="material-icons" style={{ fontSize: 22 }}>{lt.icon}</span>
                  {lt.label}
                </button>
              ))}
            </div>

            {/* Price input for sell */}
            {listingType === "sell" && (
              <div className="mt-4">
                <label className="label-md text-on-surface-variant mb-2 block">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jakarta font-bold text-on-surface-variant">$</span>
                  <input
                    type="number"
                    required={listingType === "sell"}
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-surface-low rounded-2xl font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition"
                  />
                </div>
                <p className="label-md text-on-surface-variant mt-1">+ $0.99 service fee added at checkout</p>
              </div>
            )}

            {listingType === "trade" && (
              <div className="mt-3 p-3 bg-surface-low rounded-3xl">
                <p className="font-manrope text-xs text-on-surface-variant">
                  You'll earn <span className="font-bold text-primary">{selectedCondition?.credits ?? 0} credits</span> when your listing goes live.
                </p>
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="p-4 bg-surface-low rounded-3xl">
              <p className="font-manrope text-sm text-primary">{error}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold text-base shadow-pink-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Posting…" : "Post Listing"}
          </button>
        </form>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>home</span>
          <span className="label-md">Home</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>search</span>
          <span className="label-md">Search</span>
        </Link>
        <button className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 28 }}>add_circle</span>
          <span className="label-md text-primary">Post</span>
        </button>
        <Link href="/notifications" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>layers</span>
          <span className="label-md">Rack</span>
        </Link>
        <Link href="/portal" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>confirmation_number</span>
          <span className="label-md">Credits</span>
        </Link>
      </nav>
    </div>
  )
}

export default function Sell() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <SellContent />
    </Suspense>
  )
}
