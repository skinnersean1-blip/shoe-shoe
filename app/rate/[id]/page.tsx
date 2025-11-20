"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Transaction {
  id: string
  status: string
  seller: {
    id: string
    name: string | null
    email: string | null
  }
  shoe: {
    brand: string
  }
}

export default function RatePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch transaction")
        const data = await response.json()

        if (data.status !== "DELIVERED" && data.status !== "COMPLETED") {
          setError("Transaction must be delivered before rating")
        }

        setTransaction(data)
      } catch (err) {
        setError("Failed to load transaction")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransaction()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: params.id,
          rating,
          comment: comment || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit rating")
      }

      router.push(`/transaction/${params.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to submit rating")
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

  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!transaction) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6">
        <Link
          href={`/transaction/${params.id}`}
          className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition"
        >
          ← Back to Transaction
        </Link>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Rate Your Experience</h1>
          <p className="text-gray-600 mb-8">
            How was your experience with {transaction.seller.name || transaction.seller.email}?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Stars */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-5xl focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= rating ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                placeholder="Share details about your experience..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400 text-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
