"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PortalContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") as "SINGLE" | "PAIR" | null

  if (!type || (type !== "SINGLE" && type !== "PAIR")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-4 border-pink-300">
          <h2 className="text-2xl font-fredoka font-bold text-gray-800 mb-4">Invalid Selection</h2>
          <p className="text-gray-600 mb-6">Please select a shoe type from the home page.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition shadow-lg font-fredoka font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const typeLabel = type === "SINGLE" ? "Single Shoes" : "Pairs of Shoes"
  const typeEmoji = type === "SINGLE" ? "👟" : "👟👟"
  const typeColor = type === "SINGLE" ? "blue" : "purple"

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <Link href="/" className="text-4xl font-fredoka font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition drop-shadow-lg">
          ← Shoe Shoe
        </Link>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">{typeEmoji}</div>
          <h2 className="text-5xl font-fredoka font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-4 drop-shadow-lg">{typeLabel}</h2>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
            Would you like to buy or sell?
          </p>
        </div>

        {/* Buy/Sell Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buy Card */}
          <Link
            href={`/buy?type=${type}`}
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-purple-400 hover:border-purple-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>
            <div className="relative p-8 text-center">
              <div className="text-7xl mb-4">🛒</div>
              <h3 className="text-4xl font-fredoka font-bold text-purple-600 mb-3 drop-shadow-md">Buy</h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                Browse available {typeLabel.toLowerCase()} and make a purchase!
              </p>
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-fredoka font-bold text-lg group-hover:from-purple-600 group-hover:to-pink-600 transition shadow-lg">
                Browse Inventory →
              </div>
            </div>
          </Link>

          {/* Sell Card */}
          <Link
            href={`/sell?type=${type}`}
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-green-400 hover:border-green-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-cyan-200 opacity-30"></div>
            <div className="relative p-8 text-center">
              <div className="text-7xl mb-4">💰</div>
              <h3 className="text-4xl font-fredoka font-bold text-green-600 mb-3 drop-shadow-md">Sell</h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                List your {typeLabel.toLowerCase()} for sale and reach buyers!
              </p>
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full font-fredoka font-bold text-lg group-hover:from-green-600 group-hover:to-cyan-600 transition shadow-lg">
                List Shoes →
              </div>
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            <Link href="/" className="text-purple-600 hover:underline">
              ← Change shoe type
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function Portal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 flex items-center justify-center">Loading...</div>}>
      <PortalContent />
    </Suspense>
  )
}
