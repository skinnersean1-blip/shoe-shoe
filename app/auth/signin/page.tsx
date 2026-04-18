"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || "Registration failed")
        }
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        if (result?.error) throw new Error("Registration successful but sign in failed")
        router.push(callbackUrl)
      } else {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        if (result?.error) throw new Error("Invalid email or password")
        router.push(callbackUrl)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
      {/* Hero top */}
      <div className="gradient-primary px-6 pt-12 pb-16 relative overflow-hidden">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 mb-8">
          <span className="material-icons text-white" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>

        <div className="sticker inline-block mb-3">
          <span className="label-md bg-white text-primary px-3 py-1 rounded-full">
            {isSignUp ? "New Recruit" : "Welcome Back"}
          </span>
        </div>

        <h1 className="font-jakarta font-extrabold text-3xl text-white leading-tight mb-2">
          {isSignUp ? "Join the\nPlayground" : "Back on\nthe Court"}
        </h1>
        <p className="font-manrope text-white/75 text-sm">
          {isSignUp
            ? "Create your account and start dropping heat."
            : "Sign in to access your drops, trades, and credits."}
        </p>

        {/* Decorative blob */}
        <div
          className="absolute right-[-30px] bottom-[-30px] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
      </div>

      {/* Form card */}
      <div className="flex-1 px-4 -mt-8 relative z-10">
        <div className="bg-surface-lowest rounded-5xl shadow-float p-6">

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="label-md text-on-surface-variant mb-2 block">Your name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="SneakerHead Junior"
                  className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition"
                />
              </div>
            )}

            <div>
              <label className="label-md text-on-surface-variant mb-2 block">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-surface-low rounded-2xl px-4 py-3 font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition"
              />
            </div>

            <div>
              <label className="label-md text-on-surface-variant mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-surface-low rounded-2xl px-4 py-3 pr-12 font-manrope text-sm text-on-surface ghost-border focus:outline-none focus:bg-surface-high transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-surface-low rounded-3xl">
                <p className="font-manrope text-sm text-primary">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold shadow-pink-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Please wait…" : isSignUp ? "Join" : "Let's Go"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError("") }}
              className="font-jakarta font-semibold text-sm text-primary"
            >
              {isSignUp ? "Already in the squad? Sign in" : "New here? Join the squad"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="font-manrope text-xs text-on-surface-variant">
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
