"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PortalContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") as "SINGLE" | "PAIR" | null

  if (!type || (type !== "SINGLE" && type !== "PAIR")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Selection</h2>
          <p className="text-gray-600 mb-6">Please select a shoe type from the home page.</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition">
          ← Shoe-Shoe
        </Link>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{typeEmoji}</div>
          <h2 className="text-5xl font-bold text-gray-800 mb-4">{typeLabel}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Would you like to buy or sell?
          </p>
        </div>

        {/* Buy/Sell Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buy Card */}
          <Link
            href={`/buy?type=${type}`}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${typeColor}-500 to-${typeColor}-600 opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">Buy</h3>
              <p className="text-gray-600 mb-6">
                Browse available {typeLabel.toLowerCase()} and make a purchase.
              </p>
              <div className={`inline-block px-6 py-3 bg-${typeColor}-600 text-white rounded-lg font-semibold group-hover:bg-${typeColor}-700 transition`}>
                Browse Inventory →
              </div>
            </div>
          </Link>

          {/* Sell Card */}
          <Link
            href={`/sell?type=${type}`}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">Sell</h3>
              <p className="text-gray-600 mb-6">
                List your {typeLabel.toLowerCase()} for sale and reach buyers.
              </p>
              <div className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold group-hover:bg-green-700 transition">
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
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">Loading...</div>}>
      <PortalContent />
    </Suspense>
  )
}
