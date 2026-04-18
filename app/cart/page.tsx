"use client"

import Link from "next/link"
import { useCart } from "@/components/CartContext"

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Deadstock", LIKE_NEW: "VNDS", GOOD: "Lightly Used", FAIR: "Well-Loved", WORN: "Heavy Wear",
}

const BADGE: Record<string, { label: string; cls: string }> = {
  NEW:      { label: "NEW DROP",    cls: "gradient-primary text-white" },
  LIKE_NEW: { label: "VNDS",        cls: "bg-secondary text-white" },
  GOOD:     { label: "FIRE",        cls: "bg-tertiary text-white" },
  PAIR:     { label: "PAIR",        cls: "bg-surface-highest text-on-surface" },
  SINGLE:   { label: "SINGLE SHOE", cls: "bg-surface-high text-on-surface-variant" },
}

export default function CartPage() {
  const { items, remove, clear, cashTotal, creditsTotal, count } = useCart()

  const getImg = (images: string) => {
    try { const a = JSON.parse(images); return a[0] ?? null } catch { return null }
  }

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface text-center">Your Shoe Box</h1>
          <p className="font-manrope text-xs text-on-surface-variant text-center">
            {count} Heat Item{count !== 1 ? "s" : ""} in Bag
          </p>
        </div>
        {count > 0 ? (
          <button onClick={clear} className="label-md text-primary font-jakarta font-semibold">Clear</button>
        ) : <div className="w-12" />}
      </header>

      <div className="px-4 pt-4 space-y-3">

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-24 h-24 rounded-5xl bg-surface-low flex items-center justify-center">
              <span className="material-icons text-outline-variant" style={{ fontSize: 48 }}>shopping_bag</span>
            </div>
            <p className="font-jakarta font-bold text-xl text-on-surface">Your bag is empty</p>
            <p className="font-manrope text-sm text-on-surface-variant text-center">
              Drop some heat in here first.
            </p>
            <Link href="/" className="px-6 py-3 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow">
              Shop Drops
            </Link>
          </div>
        )}

        {/* Cart items */}
        {items.map((item) => {
          const img = getImg(item.images)
          const badge = BADGE[item.condition] ?? BADGE.SINGLE
          return (
            <div key={item.id} className="bg-surface-lowest rounded-4xl p-3 shadow-ambient flex items-center gap-3">
              {/* Image */}
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-surface-low flex-shrink-0">
                {img
                  ? <img src={img} alt={item.brand} className="w-full h-full object-cover" />
                  : <span className="material-icons text-outline-variant m-auto" style={{ fontSize: 32 }}>image</span>
                }
                <span className={`absolute top-1 left-1 label-md px-1.5 py-0.5 rounded-full sticker ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-bold text-sm text-on-surface truncate">{item.brand}</p>
                <p className="font-manrope text-xs text-on-surface-variant">
                  Size {item.size} · {CONDITION_LABEL[item.condition] ?? item.condition}
                </p>
                {item.paymentType === "cash" ? (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-icons text-secondary" style={{ fontSize: 14 }}>payments</span>
                    <span className="font-jakarta font-extrabold text-sm text-on-surface">${item.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-icons text-tertiary" style={{ fontSize: 14 }}>confirmation_number</span>
                    <span className="font-jakarta font-extrabold text-sm text-on-surface">{item.creditValue} Credits</span>
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => remove(item.id)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-surface-high"
              >
                <span className="material-icons text-on-surface-variant" style={{ fontSize: 18 }}>delete_outline</span>
              </button>
            </div>
          )
        })}

        {/* Order summary */}
        {items.length > 0 && (
          <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient space-y-3">
            <h2 className="font-jakarta font-extrabold text-base text-on-surface">Order Summary</h2>

            {cashTotal > 0 && (
              <>
                <div className="flex justify-between font-manrope text-sm">
                  <span className="text-on-surface-variant">Cash Subtotal</span>
                  <span className="font-semibold text-on-surface">${cashTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-manrope text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-semibold text-secondary">FREE</span>
                </div>
                <div className="flex justify-between font-jakarta font-bold text-base border-t border-surface-high pt-2">
                  <span>Total Cash Due</span>
                  <span className="text-primary">${(cashTotal + 0.99).toFixed(2)}</span>
                </div>
              </>
            )}

            {creditsTotal > 0 && (
              <>
                {cashTotal > 0 && <div className="border-t border-surface-high" />}
                <div className="flex justify-between font-manrope text-sm">
                  <span className="text-on-surface-variant">Trade Subtotal</span>
                  <span className="font-semibold text-on-surface">{creditsTotal} Credits</span>
                </div>
                <div className="flex justify-between font-jakarta font-bold text-base border-t border-surface-high pt-2">
                  <span>Total Credits Due</span>
                  <span className="text-tertiary">{creditsTotal} Credits</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-4 z-50">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold text-base shadow-pink-glow"
          >
            <span className="material-icons" style={{ fontSize: 20 }}>lock</span>
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  )
}
