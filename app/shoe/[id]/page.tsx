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
  seller: {
    id: string
    name: string | null
    email: string | null
  }
}

export default function ShoePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [shoe, setShoe] = useState<Shoe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Purchase flow
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [offerPrice, setOfferPrice] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        const response = await fetch(`/api/shoes/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch shoe")
        const data = await response.json()
        setShoe(data)
        setOfferPrice(data.price.toString())
      } catch (err) {
        setError("Failed to load shoe details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShoe()
  }, [params.id])

  const handleBuyClick = () => {
    setShowPurchaseModal(true)
  }

  const handleSubmitOffer = async () => {
    if (!shoe) return

    setError("")
    setIsSubmitting(true)

    // Validate for guest buyers
    if (!session && (!buyerName || !buyerEmail)) {
      setError("Please provide your name and email")
      setIsSubmitting(false)
      return
    }

    const offer = parseFloat(offerPrice)
    if (isNaN(offer) || offer <= 0) {
      setError("Please enter a valid offer price")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shoeId: shoe.id,
          offerPrice: offer !== shoe.price ? offer : undefined,
          buyerName: !session ? buyerName : undefined,
          buyerEmail: !session ? buyerEmail : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create transaction")
      }

      const transaction = await response.json()
      router.push(`/transaction/${transaction.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to submit offer")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !shoe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Shoe not found"}</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const images = JSON.parse(shoe.images)
  const serviceFee = 9.99
  const totalPrice = (parseFloat(offerPrice) || shoe.price) + serviceFee

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

  const isSeller = session?.user?.id === shoe.seller.id

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6">
        <Link href={`/buy?type=${shoe.type}`} className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition">
          ← Back to Browse
        </Link>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="p-8">
              <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-xl mb-4">
                <img
                  src={images[currentImageIndex]}
                  alt={`${shoe.brand} ${shoe.color}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === idx ? "border-purple-600" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getConditionColor(shoe.condition)}`}>
                {formatCondition(shoe.condition)}
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-2">{shoe.brand}</h1>
              <p className="text-xl text-gray-600 mb-6">
                {shoe.color} • Size {shoe.size} • {shoe.year}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{shoe.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Seller</h3>
                <p className="text-gray-600">{shoe.seller.name || shoe.seller.email}</p>
              </div>

              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Asking Price:</span>
                  <span className="text-3xl font-bold text-purple-600">${shoe.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Service Fee:</span>
                  <span>$9.99</span>
                </div>
              </div>

              {shoe.status === "AVAILABLE" && !isSeller && (
                <button
                  onClick={handleBuyClick}
                  className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-lg"
                >
                  Buy or Make Offer
                </button>
              )}

              {shoe.status !== "AVAILABLE" && (
                <div className="w-full py-4 bg-gray-200 text-gray-600 rounded-lg font-semibold text-center text-lg">
                  {shoe.status === "SOLD" ? "Sold" : "Pending Sale"}
                </div>
              )}

              {isSeller && (
                <div className="w-full py-4 bg-blue-100 text-blue-800 rounded-lg font-semibold text-center text-lg">
                  This is your listing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Complete Purchase</h2>

            {!session && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-4">
                  You can continue as a guest or{" "}
                  <Link href="/auth/signin" className="font-semibold underline">
                    sign in
                  </Link>
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Offer (or buy at asking price)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {parseFloat(offerPrice) !== shoe.price && (
                <p className="text-sm text-orange-600 mt-1">
                  You're making a counteroffer. The seller will be notified.
                </p>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Your Offer:</span>
                <span className="font-semibold">${(parseFloat(offerPrice) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-semibold">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-purple-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {isSubmitting ? "Submitting..." : "Submit Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
