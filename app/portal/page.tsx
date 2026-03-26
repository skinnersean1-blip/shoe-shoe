"use client"

import Link from "next/link"
import { Suspense } from "react"

function PortalContent() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <h1 className="font-jakarta font-extrabold text-lg text-on-surface">The Playground</h1>
        <div className="w-10" />
      </header>

      {/* Hero */}
      <div className="gradient-primary px-6 pt-8 pb-10 relative overflow-hidden">
        <div className="sticker inline-block mb-4">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full">Choose your move</span>
        </div>
        <h2 className="font-jakarta font-extrabold text-3xl text-white mb-2">What's the play?</h2>
        <p className="font-manrope text-white/75 text-sm">Browse drops, post your heat, or trade for credits.</p>
        <div
          className="absolute right-[-30px] bottom-[-20px] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </div>

      {/* Action cards */}
      <div className="px-4 -mt-6 relative z-10 space-y-3">

        {/* Browse Pairs */}
        <Link
          href="/buy?type=PAIR"
          className="group flex items-center gap-4 bg-surface-lowest rounded-4xl p-5 shadow-ambient hover:scale-[1.02] transition-transform"
        >
          <div className="w-14 h-14 rounded-3xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-pink-glow">
            <span className="material-icons text-white" style={{ fontSize: 26 }}>style</span>
          </div>
          <div className="flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">Shop Paired Drops</p>
            <p className="font-manrope text-xs text-on-surface-variant mt-0.5">Complete sets for maximum swagger</p>
          </div>
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
        </Link>

        {/* Browse Singles */}
        <Link
          href="/buy?type=SINGLE"
          className="group flex items-center gap-4 bg-surface-lowest rounded-4xl p-5 shadow-ambient hover:scale-[1.02] transition-transform"
        >
          <div className="w-14 h-14 rounded-3xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-float">
            <span className="material-icons text-white" style={{ fontSize: 26 }}>directions_walk</span>
          </div>
          <div className="flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">Shop Single Shoes</p>
            <p className="font-manrope text-xs text-on-surface-variant mt-0.5">Lost one? Need a spare? We got you.</p>
          </div>
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
        </Link>

        {/* Sell Pairs */}
        <Link
          href="/sell?type=PAIR"
          className="group flex items-center gap-4 bg-surface-lowest rounded-4xl p-5 shadow-ambient hover:scale-[1.02] transition-transform"
        >
          <div className="w-14 h-14 rounded-3xl bg-tertiary flex items-center justify-center flex-shrink-0 shadow-float">
            <span className="material-icons text-white" style={{ fontSize: 26 }}>sell</span>
          </div>
          <div className="flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">Post a Drop</p>
            <p className="font-manrope text-xs text-on-surface-variant mt-0.5">List your pairs or singles and earn credits</p>
          </div>
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
        </Link>

        {/* Trade */}
        <Link
          href="/sell?type=PAIR"
          className="group flex items-center gap-4 bg-surface-lowest rounded-4xl p-5 shadow-ambient hover:scale-[1.02] transition-transform"
        >
          <div className="w-14 h-14 rounded-3xl bg-surface-highest flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-on-surface" style={{ fontSize: 26 }}>swap_horiz</span>
          </div>
          <div className="flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">Trade for Credits</p>
            <p className="font-manrope text-xs text-on-surface-variant mt-0.5">Swap kicks using SS Points</p>
          </div>
          <span className="material-icons text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
        </Link>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-2 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>local_fire_department</span>
          <span className="label-md">Drops</span>
        </Link>
        <Link href="/buy?type=PAIR" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>search</span>
          <span className="label-md">Search</span>
        </Link>
        <Link href="/portal" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-icons" style={{ fontSize: 24 }}>add_circle</span>
          <span className="label-md text-primary">Post</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>layers</span>
          <span className="label-md">Rack</span>
        </Link>
        <Link href="/auth/signin" className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition">
          <span className="material-icons" style={{ fontSize: 24 }}>person</span>
          <span className="label-md">Profile</span>
        </Link>
      </nav>
    </div>
  )
}

export default function Portal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <PortalContent />
    </Suspense>
  )
}
