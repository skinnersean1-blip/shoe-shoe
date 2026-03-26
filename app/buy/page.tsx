"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  seller: { id: string; name: string | null; email: string | null }
}

const AGE_GROUPS = [
  { key: "baby",    label: "BABY",    range: "0C–4C",  icon: "child_care" },
  { key: "toddler", label: "TODDLER", range: "5C–10C", icon: "toys" },
  { key: "youth",   label: "YOUTH",   range: "11C–7Y", icon: "directions_run" },
] as const

type AgeGroup = typeof AGE_GROUPS[number]["key"] | null

const CONDITIONS = [
  { key: "",        label: "All" },
  { key: "NEW",     label: "Brand New" },
  { key: "LIKE_NEW",label: "Lightly Worn" },
  { key: "GOOD",    label: "Well-Loved" },
]

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  NEW:      { label: "NEW DROP",  color: "bg-primary text-white" },
  LIKE_NEW: { label: "VNDS",      color: "bg-secondary text-white" },
  GOOD:     { label: "FIRE",      color: "bg-tertiary text-white" },
  FAIR:     { label: "HEAT",      color: "bg-tertiary-container text-on-surface" },
  WORN:     { label: "WELL-LOVED",color: "bg-surface-highest text-on-surface-variant" },
}

function BuyContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get("type") ?? "PAIR") as "SINGLE" | "PAIR"

  const [shoes, setShoes] = useState<Shoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null)
  const [condition, setCondition] = useState("")

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/shoes?type=${type}&status=AVAILABLE`)
      .then((r) => r.json())
      .then((data) => setShoes(Array.isArray(data) ? data : []))
      .catch(() => setShoes([]))
      .finally(() => setIsLoading(false))
  }, [type])

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images)
      return Array.isArray(arr) && arr[0] ? arr[0] : null
    } catch { return null }
  }

  const filtered = shoes.filter((s) => {
    if (condition && s.condition !== condition) return false
    return true
  })

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-50 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
            <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-surface-low rounded-full px-4 py-2">
            <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>search</span>
            <span className="font-manrope text-sm text-on-surface-variant">Search drops…</span>
          </div>
        </div>

        {/* Age group tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {AGE_GROUPS.map((ag) => (
            <button
              key={ag.key}
              onClick={() => setAgeGroup(ageGroup === ag.key ? null : ag.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-jakarta font-semibold text-xs transition-all ${
                ageGroup === ag.key
                  ? "gradient-primary text-white shadow-pink-glow"
                  : "bg-surface-low text-on-surface-variant"
              }`}
            >
              <span className="material-icons" style={{ fontSize: 14 }}>{ag.icon}</span>
              {ag.label} {ag.range}
            </button>
          ))}
          <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-low text-on-surface-variant font-jakarta font-semibold text-xs">
            <span className="material-icons" style={{ fontSize: 14 }}>casino</span>
            SURPRISE ME
          </button>
        </div>
      </header>

      {/* ── Condition Filter ── */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {CONDITIONS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCondition(c.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-manrope font-semibold text-xs transition-all ${
              condition === c.key
                ? "bg-on-surface text-surface"
                : "bg-surface-low text-on-surface-variant"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Count ── */}
      <div className="px-4 py-2">
        <p className="font-jakarta font-bold text-sm text-on-surface-variant">
          Showing {filtered.length} Fire Drop{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Type Toggle ── */}
      <div className="px-4 mb-3">
        <div className="flex bg-surface-high rounded-full p-1 gap-1 w-fit">
          <Link
            href="/buy?type=PAIR"
            className={`px-5 py-2 rounded-full font-jakarta font-semibold text-sm transition-all ${
              type === "PAIR" ? "bg-primary text-white shadow-ambient" : "text-on-surface-variant"
            }`}
          >
            Pairs
          </Link>
          <Link
            href="/buy?type=SINGLE"
            className={`px-5 py-2 rounded-full font-jakarta font-semibold text-sm transition-all ${
              type === "SINGLE" ? "bg-primary text-white shadow-ambient" : "text-on-surface-variant"
            }`}
          >
            Singles
          </Link>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="font-manrope text-on-surface-variant text-sm">Loading drops…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-5xl bg-surface-low flex items-center justify-center">
              <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>inventory</span>
            </div>
            <p className="font-jakarta font-bold text-lg text-on-surface">No drops yet</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">
              Be the first to drop some heat.
            </p>
            <Link
              href={`/sell?type=${type}`}
              className="px-6 py-3 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow"
            >
              Post a Drop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((shoe) => {
              const img = getFirstImage(shoe.images)
              const badge = BADGE_MAP[shoe.condition]
              return (
                <Link
                  key={shoe.id}
                  href={`/shoe/${shoe.id}`}
                  className="group bg-surface-lowest rounded-4xl overflow-hidden shadow-ambient hover:scale-[1.02] transition-transform"
                >
                  <div className="aspect-square relative bg-surface-low">
                    {img ? (
                      <img src={img} alt={shoe.brand} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>image</span>
                      </div>
                    )}
                    {badge && (
                      <span className={`absolute top-2 left-2 label-md px-2 py-0.5 rounded-full sticker ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-jakarta font-bold text-sm text-on-surface truncate">{shoe.brand}</p>
                    <p className="font-manrope text-xs text-on-surface-variant mb-1">Size {shoe.size}</p>
                    <p className="font-jakarta font-extrabold text-primary">${shoe.price.toFixed(2)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>local_fire_department</span>
          <span className="label-md">Drops</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>straighten</span>
          <span className="label-md text-primary">Sizes</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>casino</span>
          <span className="label-md">Random</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>inventory_2</span>
          <span className="label-md">Vault</span>
        </Link>
      </nav>
    </div>
  )
}

export default function Buy() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <BuyContent />
    </Suspense>
  )
}
