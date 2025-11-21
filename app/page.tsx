"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <div className="text-6xl font-bungee text-red-600 mb-2">TEST BUNGEE</div>
          <div className="text-6xl font-luckiest-guy text-blue-600 mb-2">TEST LUCKIEST</div>
          <h1 className="text-4xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-lg">
            Shoe Shoe
          </h1>
        </div>
        <div className="flex gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium">Welcome, {session.user?.name || session.user?.email}</span>
              <Link
                href="/api/auth/signout"
                className="px-4 py-2 bg-pink-400 text-white rounded-full hover:bg-pink-500 transition shadow-md font-quicksand font-semibold"
              >
                Sign Out
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition shadow-lg font-quicksand font-semibold"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-6xl md:text-7xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-6 drop-shadow-2xl" style={{textShadow: '3px 3px 0px rgba(255,255,255,0.5), 5px 5px 0px rgba(0,0,0,0.1)'}}>
            Shoe Shoe
          </h2>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
            The super fun marketplace for children's shoes! Buy and sell singles or pairs! 🎉
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Single Shoes Card */}
          <Link
            href="/portal?type=SINGLE"
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-cyan-400 hover:border-cyan-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-200 opacity-30"></div>
            <div className="relative p-8 text-center">
              <div className="text-7xl mb-4 animate-bounce">👟</div>
              <h3 className="text-4xl font-bungee text-cyan-600 mb-3 drop-shadow-md">
                Single Shoes
              </h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                Lost one? Find a mate! Perfect for parents looking to complete a pair! 👟
              </p>
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-quicksand font-bold text-lg group-hover:from-cyan-600 group-hover:to-blue-600 transition shadow-lg">
                Browse Singles →
              </div>
            </div>
          </Link>

          {/* Pairs Card */}
          <Link
            href="/portal?type=PAIR"
            className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-pink-400 hover:border-pink-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 opacity-30"></div>
            <div className="relative p-8 text-center">
              <div className="text-7xl mb-4 animate-bounce">👟👟</div>
              <h3 className="text-4xl font-bungee text-pink-600 mb-3 drop-shadow-md">
                Pairs of Shoes
              </h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                Traditional matching pairs of children's shoes at great prices!
              </p>
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-quicksand font-bold text-lg group-hover:from-pink-600 group-hover:to-purple-600 transition shadow-lg">
                Browse Pairs →
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-300">
          <h3 className="text-3xl font-bungee text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-6">How It Works</h3>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-4 p-3 bg-cyan-50 rounded-2xl">
              <span className="text-3xl">1️⃣</span>
              <p className="text-lg"><strong className="font-quicksand text-cyan-600">Choose:</strong> Select whether you're looking for single shoes or pairs</p>
            </div>
            <div className="flex items-start gap-4 p-3 bg-pink-50 rounded-2xl">
              <span className="text-3xl">2️⃣</span>
              <p className="text-lg"><strong className="font-quicksand text-pink-600">Buy or Sell:</strong> Browse available shoes or list your own</p>
            </div>
            <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-2xl">
              <span className="text-3xl">3️⃣</span>
              <p className="text-lg"><strong className="font-quicksand text-purple-600">Connect:</strong> Make offers, negotiate, and complete the sale</p>
            </div>
            <div className="flex items-start gap-4 p-3 bg-yellow-50 rounded-2xl">
              <span className="text-3xl">4️⃣</span>
              <p className="text-lg"><strong className="font-quicksand text-yellow-600">Ship & Rate:</strong> Sellers ship, buyers receive and rate</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-400">
            <p className="text-base text-gray-800 font-medium">
              <strong className="font-quicksand text-orange-600">Service Fee:</strong> A $0.99 fee is added to each purchase to keep Shoe Shoe running smoothly! 🎈
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
