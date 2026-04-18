"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Shoe {
  id: string
  brand: string
  size: string
  price: number
  condition: string
  images: string
  status: string
  type: string
}

type Tab = "closet" | "activity" | "saved"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("closet")
  const [myShoes, setMyShoes] = useState<Shoe[]>([])
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return

    fetch("/api/shoes?status=AVAILABLE&moderationStatus=PENDING_REVIEW")
      .then(r => r.json()).then(d => setMyShoes(Array.isArray(d) ? d : [])).catch(() => {})
    fetch("/api/credits")
      .then(r => r.json()).then(d => setCredits(d.balance ?? 0)).catch(() => {})
  }, [status, router])

  const getImg = (images: string) => {
    try { const a = JSON.parse(images); return a[0] ?? null } catch { return null }
  }

  if (status === "loading") return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  const userName = session?.user?.name ?? session?.user?.email ?? "Sneakerhead"
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>menu</span>
        </button>
        <h1 className="font-jakarta font-extrabold text-lg text-on-surface">My Closet</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low"
        >
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 22 }}>logout</span>
        </button>
      </header>

      {/* Cover + avatar */}
      <div className="relative">
        <div className="h-32 gradient-primary" />
        <div className="absolute left-4 -bottom-10 w-20 h-20 rounded-full gradient-primary border-4 border-surface-lowest flex items-center justify-center shadow-float">
          <span className="font-jakarta font-extrabold text-2xl text-white">{initials}</span>
        </div>
      </div>

      <div className="px-4 pt-14 pb-4">
        {/* Name + verified */}
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="font-jakarta font-extrabold text-xl text-on-surface">{userName}</h2>
          <span className="material-icons text-secondary" style={{ fontSize: 18 }}>verified</span>
        </div>
        <p className="font-manrope text-sm text-on-surface-variant mb-4">Curating grails since '24 👟✨</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: "swap_horiz", label: "Trades",  value: "0" },
            { icon: "sell",       label: "Sold",    value: myShoes.length.toString() },
            { icon: "star",       label: "Rating",  value: "5.0" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-lowest rounded-3xl p-3 text-center shadow-ambient">
              <span className="material-icons text-primary" style={{ fontSize: 18 }}>{s.icon}</span>
              <p className="font-jakarta font-extrabold text-lg text-on-surface">{s.value}</p>
              <p className="label-md text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Credits badge */}
        <div className="flex items-center gap-3 bg-surface-lowest rounded-4xl p-4 shadow-ambient mb-5">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <span className="material-icons text-white" style={{ fontSize: 18 }}>confirmation_number</span>
          </div>
          <div className="flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">{credits} SS Points</p>
            <p className="font-manrope text-xs text-on-surface-variant">Available credits</p>
          </div>
          <Link href="/credits" className="label-md text-primary font-jakarta font-semibold">View</Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-high rounded-full p-1 gap-1 mb-4">
          {(["closet","activity","saved"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full font-jakarta font-semibold text-xs capitalize transition-all ${tab === t ? "gradient-primary text-white shadow-ambient" : "text-on-surface-variant"}`}
            >
              {t === "closet" ? "My Closet" : t === "activity" ? "Activity" : "Saved"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "closet" && (
          <>
            {myShoes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>inventory_2</span>
                <p className="font-jakarta font-bold text-on-surface">Your closet is empty</p>
                <Link href="/sell?type=PAIR" className="px-5 py-2.5 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow text-sm">
                  Post a Drop
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myShoes.map((shoe) => {
                  const img = getImg(shoe.images)
                  return (
                    <Link key={shoe.id} href={`/shoe/${shoe.id}`}
                      className="bg-surface-lowest rounded-4xl overflow-hidden shadow-ambient hover:scale-[1.02] transition-transform">
                      <div className="aspect-square bg-surface-low relative">
                        {img
                          ? <img src={img} alt={shoe.brand} className="w-full h-full object-cover" />
                          : <span className="material-icons text-outline-variant absolute inset-0 m-auto" style={{ fontSize: 40 }}>image</span>
                        }
                        <span className={`absolute top-2 right-2 label-md px-2 py-0.5 rounded-full ${shoe.status === "AVAILABLE" ? "bg-secondary text-white" : "bg-surface-high text-on-surface-variant"}`}>
                          {shoe.status === "AVAILABLE" ? "Live" : "Sold"}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-jakarta font-bold text-sm text-on-surface truncate">{shoe.brand}</p>
                        <p className="font-jakarta font-extrabold text-primary text-sm">${shoe.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <Link href="/sell?type=PAIR"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-surface-highest text-on-surface font-jakarta font-bold">
              <span className="material-icons" style={{ fontSize: 18 }}>add</span>
              Add to Closet
            </Link>
          </>
        )}

        {tab === "activity" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>history</span>
            <p className="font-jakarta font-bold text-on-surface">No activity yet</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">Your trades and sales will appear here.</p>
          </div>
        )}

        {tab === "saved" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>favorite_border</span>
            <p className="font-jakarta font-bold text-on-surface">No saved drops</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">Heart a shoe to save it here.</p>
          </div>
        )}
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
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>face_5</span>
          <span className="label-md text-primary">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
