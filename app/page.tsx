"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-600">Shoe-Shoe</h1>
        <div className="flex gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {session.user?.name || session.user?.email}</span>
              <Link
                href="/api/auth/signout"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Sign Out
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Shoe-Shoe
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The marketplace for children's shoes. Buy and sell singles or pairs -
            perfect for kids who grow at different rates!
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Single Shoes Card */}
          <Link
            href="/portal?type=SINGLE"
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👟</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Single Shoes
              </h3>
              <p className="text-gray-600 mb-6">
                Perfect for when one foot grows faster than the other, or you just need to replace one shoe.
              </p>
              <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition">
                Browse Singles →
              </div>
            </div>
          </Link>

          {/* Pairs Card */}
          <Link
            href="/portal?type=PAIR"
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👟👟</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Pairs of Shoes
              </h3>
              <p className="text-gray-600 mb-6">
                Traditional matching pairs of children's shoes at great prices.
              </p>
              <div className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition">
                Browse Pairs →
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h3>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p><strong>Choose:</strong> Select whether you're looking for single shoes or pairs</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p><strong>Buy or Sell:</strong> Browse available shoes or list your own</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p><strong>Connect:</strong> Make offers, negotiate, and complete the sale</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <p><strong>Ship & Rate:</strong> Sellers ship, buyers receive and rate</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Service Fee:</strong> A $9.99 fee is added to each purchase to keep Shoe-Shoe running smoothly.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
