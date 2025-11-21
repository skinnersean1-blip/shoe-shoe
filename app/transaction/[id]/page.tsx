"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Transaction {
  id: string
  status: string
  offerPrice: number | null
  finalPrice: number
  serviceFee: number
  trackingNumber: string | null
  shippingMethod: string | null
  shippedAt: string | null
  deliveredAt: string | null
  buyerName: string | null
  buyerEmail: string | null
  shoe: {
    id: string
    brand: string
    color: string
    size: string
    images: string
  }
  seller: {
    id: string
    name: string | null
    email: string | null
  }
  buyer: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export default function TransactionPage() {
  const params = useParams()
  const { data: session } = useSession()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Shipping form
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingMethod, setShippingMethod] = useState("")

  const fetchTransaction = async () => {
    try {
      const response = await fetch(`/api/transactions/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch transaction")
      const data = await response.json()
      setTransaction(data)
    } catch (err) {
      setError("Failed to load transaction details")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaction()
  }, [params.id])

  const handleAction = async (action: string) => {
    setError("")
    setIsSubmitting(true)

    try {
      const body: any = { action }

      if (action === "ship") {
        if (!shippingMethod) {
          setError("Please enter shipping method")
          setIsSubmitting(false)
          return
        }
        body.shippingMethod = shippingMethod
        body.trackingNumber = trackingNumber || undefined
      }

      const response = await fetch(`/api/transactions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update transaction")
      }

      await fetchTransaction()
    } catch (err: any) {
      setError(err.message || "Failed to update transaction")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error && !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border-4 border-pink-300">
          <h2 className="text-2xl font-bungee text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition shadow-lg font-quicksand font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!transaction) return null

  const isSeller = session?.user?.id === transaction.seller.id
  const isBuyer =
    session?.user?.id === transaction.buyer?.id ||
    session?.user?.email === transaction.buyerEmail

  const images = JSON.parse(transaction.shoe.images)
  const totalPrice = transaction.finalPrice + transaction.serviceFee

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", text: "Pending Seller Response" }
      case "COUNTEROFFER":
        return { color: "bg-orange-100 text-orange-800", text: "Counteroffer Pending" }
      case "ACCEPTED":
        return { color: "bg-green-100 text-green-800", text: "Offer Accepted" }
      case "PAYMENT_PENDING":
        return { color: "bg-blue-100 text-blue-800", text: "Awaiting Payment" }
      case "PAID":
        return { color: "bg-green-100 text-green-800", text: "Payment Received" }
      case "SHIPPED":
        return { color: "bg-purple-100 text-purple-800", text: "Shipped" }
      case "DELIVERED":
        return { color: "bg-green-100 text-green-800", text: "Delivered" }
      case "COMPLETED":
        return { color: "bg-green-100 text-green-800", text: "Completed" }
      case "CANCELLED":
        return { color: "bg-red-100 text-red-800", text: "Cancelled" }
      default:
        return { color: "bg-gray-100 text-gray-800", text: status }
    }
  }

  const statusInfo = getStatusInfo(transaction.status)

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="text-4xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition drop-shadow-lg">
          ← Shoe Shoe
        </Link>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Details</h1>
              <p className="text-gray-600">Transaction ID: {transaction.id}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>

          {/* Shoe Info */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shoe Details</h2>
            <div className="flex gap-4">
              <img
                src={images[0]}
                alt={transaction.shoe.brand}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{transaction.shoe.brand}</h3>
                <p className="text-gray-600">
                  {transaction.shoe.color} • Size {transaction.shoe.size}
                </p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Participants</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-semibold text-gray-800">
                  {transaction.seller.name || transaction.seller.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Buyer</p>
                <p className="font-semibold text-gray-800">
                  {transaction.buyer?.name ||
                    transaction.buyer?.email ||
                    transaction.buyerName ||
                    transaction.buyerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pricing</h2>
            <div className="space-y-2">
              {transaction.offerPrice && (
                <div className="flex justify-between text-orange-600">
                  <span>Counteroffer Price:</span>
                  <span className="font-semibold">${transaction.offerPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shoe Price:</span>
                <span className="font-semibold">${transaction.finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-semibold">${transaction.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-purple-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {transaction.status === "SHIPPED" ||
            transaction.status === "DELIVERED" ||
            (transaction.status === "COMPLETED" && (
              <div className="border-t pt-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-semibold">{transaction.shippingMethod}</span>
                  </div>
                  {transaction.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-semibold">{transaction.trackingNumber}</span>
                    </div>
                  )}
                  {transaction.shippedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipped:</span>
                      <span className="font-semibold">
                        {new Date(transaction.shippedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {transaction.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-semibold">
                        {new Date(transaction.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Actions */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Seller Actions */}
          {isSeller && transaction.status === "COUNTEROFFER" && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Buyer offered ${transaction.offerPrice?.toFixed(2)}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAction("accept")}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  Accept Offer
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  Reject Offer
                </button>
              </div>
            </div>
          )}

          {isSeller &&
            (transaction.status === "ACCEPTED" || transaction.status === "PAID") && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Shipment</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Shipping Method (e.g., USPS, UPS, FedEx) *"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Number (optional)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAction("ship")}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Shipment"}
                  </button>
                </div>
              </div>
            )}

          {/* Buyer Actions */}
          {isBuyer && transaction.status === "SHIPPED" && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delivery
              </h3>
              <p className="text-gray-600 mb-4">
                Once you receive the shoes, please confirm delivery below.
              </p>
              <button
                onClick={() => handleAction("confirm_delivery")}
                disabled={isSubmitting}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {isSubmitting ? "Processing..." : "Confirm Delivery"}
              </button>
            </div>
          )}

          {isBuyer && transaction.status === "DELIVERED" && (
            <div className="border-t pt-6">
              <Link
                href={`/rate/${transaction.id}`}
                className="block w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-center"
              >
                Rate This Transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
