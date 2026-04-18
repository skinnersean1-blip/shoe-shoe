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
  shoe: { id: string; brand: string; color: string; size: string; images: string }
  seller: { id: string; name: string | null; email: string | null }
  buyer: { id: string; name: string | null; email: string | null } | null
}

const SHIP_STEPS = [
  { icon: "camera_alt",      label: "Snap final photos",   sub: "Show condition before boxing" },
  { icon: "inventory_2",     label: "Box it up tight",     sub: "Include original box if possible" },
  { icon: "local_shipping",  label: "Drop at carrier",     sub: "USPS / UPS / FedEx accepted" },
]

const TRACK_STEPS = [
  { icon: "check_circle",   label: "Order Confirmed",    status: ["ACCEPTED","PAYMENT_PENDING","PAID","SHIPPED","DELIVERED","COMPLETED"] },
  { icon: "payments",       label: "Payment Received",   status: ["PAID","SHIPPED","DELIVERED","COMPLETED"] },
  { icon: "local_shipping", label: "Dropped Off",        status: ["SHIPPED","DELIVERED","COMPLETED"] },
  { icon: "home",           label: "Delivered",          status: ["DELIVERED","COMPLETED"] },
]

export default function TransactionPage() {
  const params = useParams()
  const { data: session } = useSession()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingMethod, setShippingMethod] = useState("")
  const [checklist, setChecklist] = useState([false, false, false])

  const fetchTransaction = async () => {
    try {
      const res = await fetch(`/api/transactions/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch transaction")
      setTransaction(await res.json())
    } catch { setError("Failed to load transaction") }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchTransaction() }, [params.id])

  const handleAction = async (action: string) => {
    setError("")
    setIsSubmitting(true)
    try {
      const body: Record<string, unknown> = { action }
      if (action === "ship") {
        if (!shippingMethod) { setError("Please enter a shipping method"); setIsSubmitting(false); return }
        body.shippingMethod = shippingMethod
        if (trackingNumber) body.trackingNumber = trackingNumber
      }
      const res = await fetch(`/api/transactions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Update failed") }
      await fetchTransaction()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally { setIsSubmitting(false) }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  if (!transaction) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
      <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>error_outline</span>
      <p className="font-jakarta font-bold text-on-surface">{error || "Transaction not found"}</p>
      <Link href="/" className="px-5 py-2.5 rounded-full gradient-primary text-white font-jakarta font-bold text-sm shadow-pink-glow">
        Go Home
      </Link>
    </div>
  )

  const isSeller = session?.user?.id === transaction.seller.id
  const isBuyer = session?.user?.id === transaction.buyer?.id || session?.user?.email === transaction.buyerEmail
  const images = (() => { try { return JSON.parse(transaction.shoe.images) } catch { return [] } })()
  const img = images[0] ?? null
  const totalPrice = transaction.finalPrice + transaction.serviceFee

  const isShipMode = isSeller && (transaction.status === "ACCEPTED" || transaction.status === "PAID")
  const isTrackMode = ["SHIPPED", "DELIVERED", "COMPLETED"].includes(transaction.status)

  const getStatusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      PENDING:         { label: "Pending",         cls: "bg-surface-high text-on-surface-variant" },
      ACCEPTED:        { label: "Accepted",         cls: "bg-secondary/10 text-secondary" },
      PAYMENT_PENDING: { label: "Awaiting Payment", cls: "bg-tertiary/10 text-tertiary" },
      PAID:            { label: "Ready to Ship",    cls: "bg-secondary/10 text-secondary" },
      SHIPPED:         { label: "In Transit",       cls: "gradient-primary text-white" },
      DELIVERED:       { label: "Delivered",        cls: "bg-secondary/20 text-secondary" },
      COMPLETED:       { label: "Completed",        cls: "bg-secondary/20 text-secondary" },
      CANCELLED:       { label: "Cancelled",        cls: "bg-surface-high text-on-surface-variant" },
    }
    return map[s] ?? { label: s, cls: "bg-surface-high text-on-surface-variant" }
  }

  const badge = getStatusBadge(transaction.status)

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center gap-3">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">
            {isShipMode ? "Prep Mode" : isTrackMode ? "Trade Journey" : "Transaction"}
          </h1>
          <p className="font-manrope text-xs text-on-surface-variant">
            {isShipMode ? "Ready to Ship?" : isTrackMode ? "Tracking your drop" : `ID: ${transaction.id.slice(0, 8)}…`}
          </p>
        </div>
        <span className={`label-md px-3 py-1 rounded-full sticker font-jakarta font-bold text-xs ${badge.cls}`}>
          {badge.label}
        </span>
      </header>

      <div className="px-4 pt-4 space-y-4">

        {/* Shoe card */}
        <div className="bg-surface-lowest rounded-4xl overflow-hidden shadow-float flex">
          <div className="w-28 h-28 bg-surface-low flex-shrink-0 relative">
            {img
              ? <img src={img} alt={transaction.shoe.brand} className="w-full h-full object-cover" />
              : <span className="material-icons text-outline-variant absolute inset-0 m-auto" style={{ fontSize: 40 }}>image</span>
            }
          </div>
          <div className="p-4 flex flex-col justify-center flex-1">
            <p className="font-jakarta font-extrabold text-base text-on-surface">{transaction.shoe.brand}</p>
            <p className="font-manrope text-xs text-on-surface-variant mb-2">
              {transaction.shoe.color} · Size {transaction.shoe.size}
            </p>
            <div className="flex gap-2">
              <span className="label-md bg-surface-high text-on-surface-variant px-2 py-0.5 rounded-full">
                ${transaction.finalPrice.toFixed(2)}
              </span>
              <span className="label-md bg-surface-high text-on-surface-variant px-2 py-0.5 rounded-full">
                +${transaction.serviceFee.toFixed(2)} fee
              </span>
            </div>
          </div>
        </div>

        {/* === SHIP MODE: Prep Mode === */}
        {isShipMode && (
          <>
            <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-2xl gradient-primary flex items-center justify-center">
                  <span className="material-icons text-white" style={{ fontSize: 18 }}>rocket_launch</span>
                </div>
                <div>
                  <h2 className="font-jakarta font-extrabold text-base text-on-surface">Prep Mode</h2>
                  <p className="font-manrope text-xs text-on-surface-variant">Check each step before you ship</p>
                </div>
              </div>
              <div className="space-y-3">
                {SHIP_STEPS.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setChecklist(prev => { const n = [...prev]; n[i] = !n[i]; return n })}
                    className={`w-full flex items-center gap-3 p-3 rounded-3xl transition-all text-left ${checklist[i] ? "bg-secondary/10 ring-2 ring-secondary/30" : "bg-surface-low"}`}
                  >
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${checklist[i] ? "gradient-primary" : "bg-surface-highest"}`}>
                      <span className={`material-icons ${checklist[i] ? "text-white" : "text-on-surface-variant"}`} style={{ fontSize: 18 }}>
                        {checklist[i] ? "check" : step.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-jakarta font-bold text-sm ${checklist[i] ? "text-secondary line-through" : "text-on-surface"}`}>{step.label}</p>
                      <p className="font-manrope text-xs text-on-surface-variant">{step.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping details input */}
            <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient space-y-3">
              <h2 className="font-jakarta font-extrabold text-base text-on-surface">Shipping Details</h2>
              <select
                value={shippingMethod}
                onChange={e => setShippingMethod(e.target.value)}
                className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-manrope text-sm text-on-surface ghost-border focus:outline-none appearance-none"
              >
                <option value="">Select carrier…</option>
                <option value="USPS">USPS</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
              </select>
              <input
                type="text"
                placeholder="Tracking number (optional)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-manrope text-sm text-on-surface ghost-border focus:outline-none"
              />
              {error && <p className="font-manrope text-xs text-primary">{error}</p>}
            </div>

            <button
              onClick={() => handleAction("ship")}
              disabled={isSubmitting || checklist.some(c => !c)}
              className="w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold text-base shadow-pink-glow disabled:opacity-50"
            >
              {isSubmitting ? "Confirming…" : checklist.some(c => !c) ? `Complete ${checklist.filter(Boolean).length}/3 steps first` : "Confirm Shipment 🚀"}
            </button>
          </>
        )}

        {/* === TRACK MODE: Trade Journey === */}
        {isTrackMode && (
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <h2 className="font-jakarta font-extrabold text-base text-on-surface mb-5">Trade Journey</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-surface-high" />
              <div className="space-y-5">
                {TRACK_STEPS.map((step, i) => {
                  const done = step.status.includes(transaction.status)
                  return (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${done ? "gradient-primary shadow-pink-glow" : "bg-surface-high"}`}>
                        <span className={`material-icons ${done ? "text-white" : "text-on-surface-variant"}`} style={{ fontSize: 18 }}>
                          {step.icon}
                        </span>
                      </div>
                      <div>
                        <p className={`font-jakarta font-bold text-sm ${done ? "text-on-surface" : "text-on-surface-variant"}`}>{step.label}</p>
                        {i === 2 && transaction.trackingNumber && done && (
                          <p className="font-manrope text-xs text-on-surface-variant">#{transaction.trackingNumber}</p>
                        )}
                        {i === 2 && transaction.shippedAt && done && (
                          <p className="font-manrope text-xs text-on-surface-variant">{new Date(transaction.shippedAt).toLocaleDateString()}</p>
                        )}
                        {i === 3 && transaction.deliveredAt && done && (
                          <p className="font-manrope text-xs text-on-surface-variant">{new Date(transaction.deliveredAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {transaction.shippingMethod && (
              <div className="mt-4 flex items-center gap-3 bg-surface-low rounded-3xl p-3">
                <span className="material-icons text-primary" style={{ fontSize: 20 }}>local_shipping</span>
                <p className="font-manrope text-sm text-on-surface">{transaction.shippingMethod}</p>
              </div>
            )}
          </div>
        )}

        {/* Seller: counteroffer */}
        {isSeller && transaction.status === "COUNTEROFFER" && (
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <h2 className="font-jakarta font-extrabold text-base text-on-surface mb-3">
              Buyer offered ${transaction.offerPrice?.toFixed(2)}
            </h2>
            <div className="flex gap-3">
              <button onClick={() => handleAction("accept")} disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-secondary/10 text-secondary font-jakarta font-bold text-sm">
                Accept
              </button>
              <button onClick={() => handleAction("reject")} disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-primary/10 text-primary font-jakarta font-bold text-sm">
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Buyer: confirm delivery */}
        {isBuyer && transaction.status === "SHIPPED" && (
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
            <h2 className="font-jakarta font-extrabold text-base text-on-surface mb-1">Got your kicks?</h2>
            <p className="font-manrope text-xs text-on-surface-variant mb-3">Confirm delivery to release payment to the seller.</p>
            <button onClick={() => handleAction("confirm_delivery")} disabled={isSubmitting}
              className="w-full py-3.5 rounded-full gradient-primary text-white font-jakarta font-extrabold shadow-pink-glow">
              {isSubmitting ? "Processing…" : "Confirm Delivery ✓"}
            </button>
          </div>
        )}

        {/* Rate link */}
        {isBuyer && transaction.status === "DELIVERED" && (
          <Link href={`/rate/${transaction.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full gradient-primary text-white font-jakarta font-extrabold shadow-pink-glow">
            <span className="material-icons" style={{ fontSize: 18 }}>star</span>
            Rate This Trade
          </Link>
        )}

        {/* Error */}
        {error && !isShipMode && (
          <p className="font-manrope text-xs text-primary text-center">{error}</p>
        )}

        {/* Price summary */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient space-y-2">
          <h2 className="font-jakarta font-extrabold text-base text-on-surface">Order Summary</h2>
          <div className="flex justify-between font-manrope text-sm">
            <span className="text-on-surface-variant">Shoe price</span>
            <span className="font-semibold text-on-surface">${transaction.finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-manrope text-sm">
            <span className="text-on-surface-variant">Service fee</span>
            <span className="font-semibold text-on-surface">${transaction.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-jakarta font-bold text-base border-t border-surface-high pt-2">
            <span>Total</span>
            <span className="text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Parties */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <h2 className="font-jakarta font-extrabold text-sm text-on-surface mb-3">People</h2>
          <div className="space-y-2">
            {[
              { role: "Seller", user: transaction.seller },
              { role: "Buyer",  user: transaction.buyer ?? { name: transaction.buyerName, email: transaction.buyerEmail, id: "" } },
            ].map(({ role, user }) => user && (
              <div key={role} className="flex items-center gap-3 bg-surface-low rounded-3xl p-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="font-jakarta font-extrabold text-xs text-white">
                    {(user.name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-jakarta font-bold text-sm text-on-surface">{user.name ?? user.email ?? "—"}</p>
                  <p className="font-manrope text-xs text-on-surface-variant">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
