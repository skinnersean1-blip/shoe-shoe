"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

function SellContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const type = searchParams.get("type") as "SINGLE" | "PAIR" | null

  const [formData, setFormData] = useState({
    brand: "",
    year: new Date().getFullYear(),
    color: "",
    size: "",
    condition: "GOOD",
    description: "",
    price: "",
  })

  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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

  const typeLabel = type === "SINGLE" ? "Single Shoe" : "Pair of Shoes"

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files).slice(0, 5) // Max 5 images

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 5))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!session) {
      setError("You must be signed in to sell shoes. Redirecting to sign in...")
      setTimeout(() => router.push("/auth/signin"), 2000)
      return
    }

    if (formData.description.length > 500) {
      setError("Description must be 500 characters or less")
      setIsSubmitting(false)
      return
    }

    if (images.length === 0) {
      setError("Please upload at least one image")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/shoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type,
          images: JSON.stringify(images),
          price: parseFloat(formData.price),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create listing")
      }

      const data = await response.json()
      router.push(`/shoe/${data.id}`)
    } catch (err) {
      setError("Failed to create listing. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6">
        <Link href={`/portal?type=${type}`} className="text-3xl font-bold text-purple-600 hover:text-purple-700 transition">
          ← Back
        </Link>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sell {typeLabel}</h1>
          <p className="text-gray-600 mb-8">Fill out the details below to list your shoes for sale.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Nike, Adidas, New Balance"
              />
            </div>

            {/* Year & Color */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Red, Blue, Black"
                />
              </div>
            </div>

            {/* Size & Condition */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Size *
                </label>
                <input
                  type="text"
                  required
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 5, 6.5, 7"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="WORN">Worn</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description * ({formData.description.length}/500)
              </label>
              <textarea
                required
                maxLength={500}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                placeholder="Describe the shoes, any notable features, wear, etc."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Note: A $9.99 service fee will be added to the buyer at checkout
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images * (Max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Listing..." : "Create Listing"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function Sell() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">Loading...</div>}>
      <SellContent />
    </Suspense>
  )
}
