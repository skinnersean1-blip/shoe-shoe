"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, cashTotal, creditsTotal, clear } = useCart()
  const { data: session } = useSession()
  const router = useRouter()

  const [address, setAddress] = useState({
    name: session?.user?.name ?? "",
    line1: "",
    city: "",
    state: "",
    zip: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"card" | "credits">("card")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editAddress, setEditAddress] = useState(false)

  const shipping = 12.00
  const grandTotal = cashTotal + 0.99 + shipping

  const handleConfirm = async () => {
    setIsSubmitting(true)
    // Placeholder: create transactions for each item
    await new Promise((r) => setTimeout(r, 1200))
    clear()
    router.push("/")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-jakarta font-bold text-xl text-on-surface">Your bag is empty</p>
        <Link href="/" className="px-6 py-3 rounded-full gradient-primary text-white font-jakarta font-bold shadow-pink-glow">
          Shop Drops
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-36">

      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center gap-3">
        <Link href="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Secure Checkout</h1>
          <p className="font-manrope text-xs text-on-surface-variant">Ready for your next big drop?</p>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">

        {/* Shipping address */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-icons text-primary" style={{ fontSize: 20 }}>location_on</span>
              <h2 className="font-jakarta font-bold text-sm text-on-surface">Shipping Address</h2>
            </div>
            <button onClick={() => setEditAddress(!editAddress)} className="label-md text-primary font-jakarta font-semibold">
              {editAddress ? "Done" : "Edit"}
            </button>
          </div>

          {editAddress ? (
            <div className="space-y-2">
              {(["name","line1","city","state","zip"] as const).map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={{ name:"Full name", line1:"Street address", city:"City", state:"State", zip:"ZIP" }[field]}
                  value={address[field]}
                  onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                  className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-manrope text-sm text-on-surface ghost-border focus:outline-none"
                />
              ))}
            </div>
          ) : (
            <p className="font-manrope text-sm text-on-surface-variant">
              {address.line1 ? `${address.name}, ${address.line1}, ${address.city} ${address.state} ${address.zip}` : "Add your shipping address"}
            </p>
          )}
        </div>

        {/* Shipping method */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-primary" style={{ fontSize: 20 }}>local_shipping</span>
            <h2 className="font-jakarta font-bold text-sm text-on-surface">Shipping Method</h2>
          </div>
          <div className="flex items-center gap-3 bg-surface-low rounded-3xl p-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="material-icons text-white" style={{ fontSize: 18 }}>bolt</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-jakarta font-bold text-sm text-on-surface">Swift Kicks Delivery</p>
                <span className="label-md gradient-primary text-white px-2 py-0.5 rounded-full sticker">KIDS' CHOICE</span>
              </div>
              <p className="font-manrope text-xs text-on-surface-variant">24–48 hours</p>
            </div>
            <p className="font-jakarta font-bold text-sm text-on-surface">${shipping.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-primary" style={{ fontSize: 20 }}>payment</span>
            <h2 className="font-jakarta font-bold text-sm text-on-surface">Payment Method</h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full flex items-center gap-3 p-3 rounded-3xl transition-all ${paymentMethod === "card" ? "bg-surface-low ring-2 ring-primary" : "bg-surface"}`}
            >
              <span className="material-icons text-secondary" style={{ fontSize: 22 }}>credit_card</span>
              <div className="flex-1 text-left">
                <p className="font-jakarta font-bold text-sm text-on-surface">Card •••• 4242</p>
                <p className="font-manrope text-xs text-on-surface-variant">Visa</p>
              </div>
              {paymentMethod === "card" && <span className="material-icons text-primary" style={{ fontSize: 18 }}>check_circle</span>}
            </button>
            <button
              onClick={() => setPaymentMethod("credits")}
              className={`w-full flex items-center gap-3 p-3 rounded-3xl transition-all ${paymentMethod === "credits" ? "bg-surface-low ring-2 ring-primary" : "bg-surface"}`}
            >
              <span className="material-icons text-tertiary" style={{ fontSize: 22 }}>confirmation_number</span>
              <div className="flex-1 text-left">
                <p className="font-jakarta font-bold text-sm text-on-surface">Credits Wallet</p>
                <p className="font-manrope text-xs text-on-surface-variant">SS Points</p>
              </div>
              {paymentMethod === "credits" && <span className="material-icons text-primary" style={{ fontSize: 18 }}>check_circle</span>}
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient space-y-2">
          <h2 className="font-jakarta font-extrabold text-base text-on-surface mb-3">Order Summary</h2>

          {items.filter(i => i.paymentType === "cash").map((item) => (
            <div key={item.id} className="flex justify-between font-manrope text-sm">
              <span className="text-on-surface-variant truncate max-w-[60%]">{item.brand}</span>
              <span className="font-semibold text-on-surface">${item.price.toFixed(2)}</span>
            </div>
          ))}
          {items.filter(i => i.paymentType === "credits").map((item) => (
            <div key={item.id} className="flex justify-between font-manrope text-sm">
              <span className="text-on-surface-variant truncate max-w-[60%]">{item.brand}</span>
              <span className="font-semibold text-tertiary">{item.creditValue} Credits</span>
            </div>
          ))}

          <div className="border-t border-surface-high pt-2 space-y-1">
            <div className="flex justify-between font-manrope text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-semibold text-on-surface">${cashTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-manrope text-sm">
              <span className="text-on-surface-variant">Service fee</span>
              <span className="font-semibold text-on-surface">$0.99</span>
            </div>
            <div className="flex justify-between font-manrope text-sm">
              <span className="text-on-surface-variant">Shipping</span>
              <span className="font-semibold text-on-surface">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-jakarta font-bold text-base border-t border-surface-high pt-2">
              <span>Card Payment Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
            {creditsTotal > 0 && (
              <div className="flex justify-between font-jakarta font-bold text-base">
                <span>Credit Balance Due</span>
                <span className="text-tertiary">{creditsTotal} Credits</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-surface-high px-4 py-4 z-50 space-y-2">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-4 rounded-full gradient-primary text-white font-jakarta font-extrabold text-base shadow-pink-glow disabled:opacity-60"
        >
          {isSubmitting ? "Processing…" : `Confirm & Pay $${grandTotal.toFixed(2)}`}
        </button>
        <p className="text-center font-manrope text-xs text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-icons" style={{ fontSize: 12 }}>lock</span>
          Encrypted &amp; Secure Transaction
        </p>
      </div>
    </div>
  )
}
