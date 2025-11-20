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
  seller: {
    id: string
    name: string | null
    email: string | null
  }
}

function BuyContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") as "SINGLE" | "PAIR" | null

  const [shoes, setShoes] = useState<Shoe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await fetch(`/api/shoes?type=${type}&status=AVAILABLE`)
        if (!response.ok) throw new Error("Failed to fetch shoes")
        const data = await response.json()
        setShoes(data)
      } catch (err) {
        setError("Failed to load shoes")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (type) {
      fetchShoes()
    }
  }, [type])

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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "bg-green-100 text-green-800"
      case "LIKE_NEW":
        return "bg-blue-100 text-blue-800"
      case "GOOD":
        return "bg-yellow-100 text-yellow-800"
      case "FAIR":
        return "bg-orange-100 text-orange-800"
      case "WORN":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCondition = (condition: string) => {
    return condition.split("_").map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6">
        <Link href={`/portal?type=${type}`} className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition">
          ← Back
        </Link>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{typeEmoji}</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Browse {typeLabel}</h1>
          <p className="text-xl text-gray-600">
            Click on any shoe to view details and make an offer
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading shoes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && shoes.length === 0 && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Shoes Available</h3>
            <p className="text-gray-600 mb-6">
              There are no {typeLabel.toLowerCase()} for sale right now. Check back later!
            </p>
            <Link
              href={`/sell?type=${type}`}
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Be the first to sell
            </Link>
          </div>
        )}

        {/* Shoes Grid */}
        {!isLoading && !error && shoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shoes.map((shoe) => {
              const imageArray = JSON.parse(shoe.images)
              const firstImage = imageArray[0]

              return (
                <Link
                  key={shoe.id}
                  href={`/shoe/${shoe.id}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={firstImage}
                      alt={`${shoe.brand} ${shoe.color}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(shoe.condition)}`}>
                      {formatCondition(shoe.condition)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                      {shoe.brand}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {shoe.color} • Size {shoe.size} • {shoe.year}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {shoe.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          ${shoe.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">+ $9.99 service fee</p>
                      </div>
                      <div className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold group-hover:bg-purple-700 transition">
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default function Buy() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">Loading...</div>}>
      <BuyContent />
    </Suspense>
  )
}
