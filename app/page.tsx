"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Shoe {
  id: string
  type: string
  brand: string
  size: string
  price: number
  images: string
  condition: string
}

export default function Home() {
  const { data: session } = useSession()
  const [ageTab, setAgeTab] = useState<"toddler" | "youth">("toddler")
  const [pairedShoes, setPairedShoes] = useState<Shoe[]>([])
  const [singleShoes, setSingleShoes] = useState<Shoe[]>([])
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetch("/api/shoes?type=PAIR&status=AVAILABLE&limit=4")
      .then((r) => r.json())
      .then((data) => setPairedShoes(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {})

    fetch("/api/shoes?type=SINGLE&status=AVAILABLE&limit=4")
      .then((r) => r.json())
      .then((data) => setSingleShoes(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {})
  }, [])

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images)
      return Array.isArray(arr) && arr[0] ? arr[0] : null
    } catch {
      return null
    }
  }

  const isHot = (shoe: Shoe) => shoe.condition === "NEW" || shoe.condition === "LIKE_NEW"

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* ── Top Nav ── */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>menu</span>
        </button>

        {/* Logo */}
        <Link href="/" className="font-jakarta font-extrabold text-lg tracking-tight gradient-primary-text">
          UP
        </Link>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/api/auth/signout" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
              <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>person</span>
            </Link>
          ) : (
            <Link href="/auth/signin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
              <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>person_outline</span>
            </Link>
          )}
          <Link href="/buy?type=PAIR" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
            <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>shopping_bag</span>
          </Link>
        </div>
      </header>

      {/* ── Desktop Nav Links ── */}
      <nav className="hidden md:flex px-6 gap-8 py-2 border-b border-surface-high">
        <Link href="/buy?type=PAIR" className="font-jakarta font-semibold text-sm text-on-surface hover:text-primary transition">Drops</Link>
        <Link href="/buy?type=PAIR" className="font-jakarta font-semibold text-sm text-on-surface-variant hover:text-primary transition">Collections</Link>
        <Link href="/sell?type=PAIR" className="font-jakarta font-semibold text-sm text-on-surface-variant hover:text-primary transition">Sell</Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden gradient-primary px-6 pt-10 pb-0 min-h-[380px]">
        {/* Sticker badge */}
        <div className="inline-block sticker mb-4">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full shadow-ambient">
            New Season Drop
          </span>
        </div>

        <h1 className="display-lg text-white mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>
          SHOE<br />SHOE
        </h1>

        <p className="font-manrope text-white/80 text-sm mb-6 max-w-xs leading-relaxed">
          The 100% kids-only marketplace. Toddlers to Teens, curated for the next generation of sneakerheads.
        </p>

        <Link
          href="/buy?type=PAIR"
          className="inline-flex items-center gap-2 bg-white text-primary font-jakarta font-bold px-6 py-3 rounded-full shadow-pink-glow hover:scale-105 transition-transform mb-8"
        >
          Shop Drops
        </Link>

        {/* Decorative blob */}
        <div
          className="absolute right-[-40px] bottom-[-20px] w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </section>

      {/* ── Age Toggle ── */}
      <div className="px-4 py-4">
        <div className="flex bg-surface-high rounded-full p-1 w-fit gap-1">
          <button
            onClick={() => setAgeTab("toddler")}
            className={`px-5 py-2 rounded-full font-jakarta font-semibold text-sm transition-all ${
              ageTab === "toddler"
                ? "bg-primary-fixed text-white shadow-ambient"
                : "text-on-surface-variant"
            }`}
          >
            Toddler (4C–10C)
          </button>
          <button
            onClick={() => setAgeTab("youth")}
            className={`px-5 py-2 rounded-full font-jakarta font-semibold text-sm transition-all ${
              ageTab === "youth"
                ? "bg-primary-fixed text-white shadow-ambient"
                : "text-on-surface-variant"
            }`}
          >
            Youth (1Y–7Y)
          </button>
        </div>
      </div>

      {/* ── Paired Shoes ── */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-jakarta font-extrabold text-xl text-on-surface">Paired Shoes</h2>
            <p className="font-manrope text-xs text-on-surface-variant">Complete sets for maximum swagger.</p>
          </div>
          <Link href="/buy?type=PAIR" className="flex items-center gap-1 text-primary font-jakarta font-semibold text-sm">
            View All <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {pairedShoes.length === 0 ? (
            <div className="bg-surface-lowest rounded-4xl p-8 text-center shadow-ambient">
              <p className="font-manrope text-on-surface-variant text-sm">No pairs listed yet.</p>
              <Link href="/sell?type=PAIR" className="mt-3 inline-block font-jakarta font-bold text-primary text-sm">
                Be the first to sell →
              </Link>
            </div>
          ) : (
            pairedShoes.map((shoe) => {
              const img = getFirstImage(shoe.images)
              return (
                <Link
                  key={shoe.id}
                  href={`/shoe/${shoe.id}`}
                  className="group flex items-center gap-4 bg-surface-lowest rounded-4xl p-3 shadow-ambient hover:scale-[1.02] transition-transform"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-surface-low flex-shrink-0">
                    {img ? (
                      <img src={img} alt={shoe.brand} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons text-outline-variant" style={{ fontSize: 32 }}>image</span>
                      </div>
                    )}
                    {isHot(shoe) && (
                      <span className="absolute top-1 left-1 label-md bg-primary text-white px-2 py-0.5 rounded-full sticker">
                        Hot
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-bold text-on-surface truncate">{shoe.brand}</p>
                    <p className="font-manrope text-xs text-on-surface-variant">Size: {shoe.size}</p>
                    <p className="font-jakarta font-extrabold text-primary mt-1">${shoe.price.toFixed(2)}</p>
                  </div>

                  {/* Cart */}
                  <button
                    onClick={(e) => { e.preventDefault(); window.location.href = `/shoe/${shoe.id}` }}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full gradient-primary text-white shadow-pink-glow"
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>add_shopping_cart</span>
                  </button>
                </Link>
              )
            })
          )}
        </div>
      </section>

      {/* ── Single Shoes ── */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-jakarta font-extrabold text-xl text-on-surface">Single Shoes</h2>
            <p className="font-manrope text-xs text-on-surface-variant">Lost a shoe? Need a spare? We got you.</p>
          </div>
          <Link href="/buy?type=SINGLE" className="flex items-center gap-1 text-primary font-jakarta font-semibold text-sm">
            View All <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {singleShoes.length === 0 ? (
            <div className="col-span-2 bg-surface-lowest rounded-4xl p-8 text-center shadow-ambient">
              <p className="font-manrope text-on-surface-variant text-sm">No singles listed yet.</p>
              <Link href="/sell?type=SINGLE" className="mt-3 inline-block font-jakarta font-bold text-primary text-sm">
                List a single →
              </Link>
            </div>
          ) : (
            singleShoes.map((shoe) => {
              const img = getFirstImage(shoe.images)
              return (
                <Link
                  key={shoe.id}
                  href={`/shoe/${shoe.id}`}
                  className="group bg-surface-lowest rounded-4xl overflow-hidden shadow-ambient hover:scale-[1.02] transition-transform"
                >
                  <div className="aspect-square relative bg-surface-low">
                    {img ? (
                      <img src={img} alt={shoe.brand} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons text-outline-variant" style={{ fontSize: 40 }}>image</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 label-md bg-surface-lowest/90 text-on-surface-variant px-2 py-0.5 rounded-full">
                      {shoe.type === "SINGLE" ? "Single" : "Pair"}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-jakarta font-bold text-sm text-on-surface truncate">{shoe.brand}</p>
                    <p className="font-jakarta font-extrabold text-primary text-sm mt-1">${shoe.price.toFixed(2)}</p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>

      {/* ── Join the Squad ── */}
      <section className="mx-4 mb-8 gradient-primary rounded-5xl p-6 relative overflow-hidden">
        {/* Sticker */}
        <div className="absolute top-3 right-4 sticker-alt">
          <span className="font-jakarta font-extrabold text-white/90 text-xs bg-white/20 px-3 py-1 rounded-full">
            FRESH!
          </span>
        </div>

        <h2 className="font-jakarta font-extrabold text-2xl text-white mb-2">JOIN THE SQUAD</h2>
        <p className="font-manrope text-white/80 text-sm mb-5 leading-relaxed">
          Get exclusive access to limited drops, single-shoe alerts, and parent-approved sneaker news.
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/60 font-manrope text-sm ghost-border focus:outline-none focus:bg-white/30"
          />
          <button className="px-5 py-3 bg-white text-primary font-jakarta font-bold rounded-full hover:scale-105 transition-transform shadow-ambient whitespace-nowrap">
            Sign Me Up
          </button>
        </div>
      </section>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>local_fire_department</span>
          <span className="label-md text-primary">Drops</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>search</span>
          <span className="label-md">Search</span>
        </Link>
        <Link href="/portal" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>shopping_cart</span>
          <span className="label-md">Cart</span>
        </Link>
        <Link href={session ? "/notifications" : "/auth/signin"} className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>person</span>
          <span className="label-md">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
