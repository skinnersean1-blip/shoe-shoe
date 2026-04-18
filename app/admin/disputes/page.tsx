"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Dispute {
  id: string
  reason: string
  status: string
  description: string
  resolution: string | null
  createdAt: string
  transaction: {
    id: string
    finalPrice: number
    shoe: { brand: string; size: string; images: string }
    seller: { name: string | null; email: string | null }
    buyer: { name: string | null; email: string | null } | null
  }
  reporter: { name: string | null; email: string | null }
}

const REASON_LABEL: Record<string, string> = {
  NOT_AS_DESCRIBED: "Not as Described",
  ITEM_NOT_RECEIVED: "Item Not Received",
  COUNTERFEIT: "Counterfeit",
  PAYMENT_ISSUE: "Payment Issue",
  OTHER: "Other",
}

const STATUS_CLS: Record<string, string> = {
  OPEN:     "bg-primary/10 text-primary",
  PENDING:  "bg-tertiary/10 text-tertiary",
  RESOLVED: "bg-secondary/10 text-secondary",
  CLOSED:   "bg-surface-high text-on-surface-variant",
}

export default function AdminDisputesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [resolution, setResolution] = useState("")
  const [acting, setActing] = useState<string | null>(null)

  const fetchDisputes = () => {
    setIsLoading(true)
    fetch("/api/admin/disputes")
      .then(r => r.json())
      .then(d => setDisputes(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetchDisputes()
  }, [status, router])

  const resolve = async (disputeId: string, outcome: "refund" | "complete" | "close") => {
    setActing(disputeId)
    await fetch("/api/admin/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId, outcome, resolution }),
    }).catch(() => {})
    setActing(null)
    setExpanded(null)
    setResolution("")
    fetchDisputes()
  }

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  const open = disputes.filter(d => d.status === "OPEN" || d.status === "PENDING")
  const closed = disputes.filter(d => d.status === "RESOLVED" || d.status === "CLOSED")

  return (
    <div className="min-h-screen bg-surface pb-24">

      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>gavel</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">Disputes</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="font-jakarta font-extrabold text-sm text-primary">{open.length}</span>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">

        {disputes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-20 h-20 rounded-5xl bg-secondary/10 flex items-center justify-center">
              <span className="material-icons text-secondary" style={{ fontSize: 40 }}>balance</span>
            </div>
            <p className="font-jakarta font-bold text-on-surface">No disputes — all good!</p>
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <>
                <p className="font-jakarta font-bold text-sm text-on-surface-variant">Active Cases</p>
                {open.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} expanded={expanded} setExpanded={setExpanded} resolution={resolution} setResolution={setResolution} resolve={resolve} acting={acting} />)}
              </>
            )}
            {closed.length > 0 && (
              <>
                <p className="font-jakarta font-bold text-sm text-on-surface-variant mt-2">Closed Cases</p>
                {closed.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} expanded={expanded} setExpanded={setExpanded} resolution={resolution} setResolution={setResolution} resolve={resolve} acting={acting} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function DisputeCard({ dispute, expanded, setExpanded, resolution, setResolution, resolve, acting }: {
  dispute: Dispute
  expanded: string | null
  setExpanded: (id: string | null) => void
  resolution: string
  setResolution: (v: string) => void
  resolve: (id: string, outcome: "refund" | "complete" | "close") => void
  acting: string | null
}) {
  const isOpen = expanded === dispute.id
  const img = (() => { try { const a = JSON.parse(dispute.transaction.shoe.images); return a[0] ?? null } catch { return null } })()
  const isActive = dispute.status === "OPEN" || dispute.status === "PENDING"

  return (
    <div className="bg-surface-lowest rounded-4xl overflow-hidden shadow-ambient">
      <button className="w-full p-4 flex items-start gap-3 text-left" onClick={() => setExpanded(isOpen ? null : dispute.id)}>
        {/* Shoe thumbnail */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-low flex-shrink-0 relative">
          {img
            ? <img src={img} alt={dispute.transaction.shoe.brand} className="w-full h-full object-cover" />
            : <span className="material-icons text-outline-variant absolute inset-0 m-auto" style={{ fontSize: 24 }}>image</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-jakarta font-bold text-sm text-on-surface truncate">{dispute.transaction.shoe.brand}</p>
            <span className={`label-md px-2 py-0.5 rounded-full sticker ${STATUS_CLS[dispute.status] ?? "bg-surface-high text-on-surface-variant"}`}>
              {dispute.status}
            </span>
          </div>
          <p className="font-manrope text-xs text-on-surface-variant">{REASON_LABEL[dispute.reason] ?? dispute.reason}</p>
          <p className="font-manrope text-xs text-on-surface-variant">${dispute.transaction.finalPrice.toFixed(2)} · Size {dispute.transaction.shoe.size}</p>
        </div>
        <span className="material-icons text-on-surface-variant mt-1" style={{ fontSize: 20 }}>
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Parties */}
          <div className="bg-surface-low rounded-3xl p-3 space-y-2">
            {[
              { role: "Buyer",    user: dispute.transaction.buyer,   icon: "shopping_bag" },
              { role: "Seller",   user: dispute.transaction.seller,  icon: "sell" },
              { role: "Reporter", user: dispute.reporter,            icon: "flag" },
            ].map(({ role, user, icon }) => user && (
              <div key={role} className="flex items-center gap-2">
                <span className="material-icons text-on-surface-variant" style={{ fontSize: 14 }}>{icon}</span>
                <p className="font-manrope text-xs text-on-surface">
                  <strong>{role}:</strong> {user.name ?? user.email ?? "Unknown"}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {dispute.description && (
            <div className="bg-surface-low rounded-3xl p-3">
              <p className="font-manrope text-xs text-on-surface-variant mb-1">Reporter says:</p>
              <p className="font-manrope text-sm text-on-surface">{dispute.description}</p>
            </div>
          )}

          {/* Existing resolution */}
          {dispute.resolution && (
            <div className="bg-secondary/10 rounded-3xl p-3">
              <p className="font-manrope text-xs text-secondary mb-1">Resolution:</p>
              <p className="font-manrope text-sm text-on-surface">{dispute.resolution}</p>
            </div>
          )}

          {/* Actions for active disputes */}
          {isActive && (
            <>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder="Add resolution notes…"
                rows={3}
                className="w-full bg-surface-low rounded-2xl px-3 py-2 font-manrope text-sm text-on-surface ghost-border focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => resolve(dispute.id, "refund")} disabled={acting === dispute.id}
                  className="flex-1 py-2.5 rounded-full gradient-primary text-white font-jakarta font-bold text-xs shadow-pink-glow disabled:opacity-50">
                  Issue Refund
                </button>
                <button onClick={() => resolve(dispute.id, "complete")} disabled={acting === dispute.id}
                  className="flex-1 py-2.5 rounded-full bg-secondary/10 text-secondary font-jakarta font-bold text-xs disabled:opacity-50">
                  Complete Sale
                </button>
                <button onClick={() => resolve(dispute.id, "close")} disabled={acting === dispute.id}
                  className="py-2.5 px-3 rounded-full bg-surface-high text-on-surface-variant font-jakarta font-bold text-xs disabled:opacity-50">
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
