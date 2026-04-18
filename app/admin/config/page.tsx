"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Config {
  creditMultiplier: number
  shippingFee: number
  commissionPct: number
  maintenanceMode: boolean
  maxListingsPerUser: number
  minListingPrice: number
}

const DEFAULT: Config = {
  creditMultiplier: 1.0,
  shippingFee: 12.0,
  commissionPct: 9.9,
  maintenanceMode: false,
  maxListingsPerUser: 50,
  minListingPrice: 1.0,
}

export default function AdminConfigPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState<Config>(DEFAULT)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/signin"); return }
    if (status !== "authenticated") return
    fetch("/api/admin/config")
      .then(r => r.json())
      .then(d => setConfig({ ...DEFAULT, ...d }))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status, router])

  const save = async () => {
    setIsSaving(true)
    setSaved(false)
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }).catch(() => {})
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = <K extends keyof Config>(key: K, val: Config[K]) =>
    setConfig(prev => ({ ...prev, [key]: val }))

  if (status === "loading" || isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pb-32">

      <header className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-low">
          <span className="material-icons text-on-surface" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="material-icons text-on-surface" style={{ fontSize: 20 }}>tune</span>
          <h1 className="font-jakarta font-extrabold text-lg text-on-surface">System Config</h1>
        </div>
        <div className="w-10" />
      </header>

      {/* Maintenance banner */}
      {config.maintenanceMode && (
        <div className="gradient-primary px-4 py-3 flex items-center gap-2">
          <span className="material-icons text-white" style={{ fontSize: 18 }}>construction</span>
          <p className="font-jakarta font-bold text-sm text-white">Maintenance Mode is ON — site is hidden from users</p>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">

        {/* Credits */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-icons text-tertiary" style={{ fontSize: 18 }}>confirmation_number</span>
            </div>
            <div>
              <h2 className="font-jakarta font-bold text-sm text-on-surface">Credit System</h2>
              <p className="font-manrope text-xs text-on-surface-variant">Multiplier applied to all credit awards</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-manrope text-xs text-on-surface-variant">Credit Multiplier</p>
                <p className="font-jakarta font-extrabold text-sm text-tertiary">{config.creditMultiplier.toFixed(1)}×</p>
              </div>
              <input
                type="range" min="0.5" max="3" step="0.1"
                value={config.creditMultiplier}
                onChange={e => set("creditMultiplier", parseFloat(e.target.value))}
                className="w-full accent-tertiary"
              />
              <div className="flex justify-between font-manrope text-xs text-on-surface-variant mt-0.5">
                <span>0.5×</span><span>1×</span><span>3×</span>
              </div>
            </div>
            <div>
              <p className="font-manrope text-xs text-on-surface-variant mb-1">Max Listings Per User</p>
              <input
                type="number" min="1" max="500"
                value={config.maxListingsPerUser}
                onChange={e => set("maxListingsPerUser", parseInt(e.target.value) || 1)}
                className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-jakarta font-bold text-sm text-on-surface ghost-border focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="material-icons text-secondary" style={{ fontSize: 18 }}>payments</span>
            </div>
            <div>
              <h2 className="font-jakarta font-bold text-sm text-on-surface">Fees & Pricing</h2>
              <p className="font-manrope text-xs text-on-surface-variant">Platform commission and shipping costs</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-manrope text-xs text-on-surface-variant mb-1">Shipping Fee ($)</p>
              <input
                type="number" min="0" max="100" step="0.5"
                value={config.shippingFee}
                onChange={e => set("shippingFee", parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-jakarta font-bold text-sm text-on-surface ghost-border focus:outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-manrope text-xs text-on-surface-variant">Commission %</p>
                <p className="font-jakarta font-extrabold text-sm text-secondary">{config.commissionPct.toFixed(1)}%</p>
              </div>
              <input
                type="range" min="0" max="25" step="0.1"
                value={config.commissionPct}
                onChange={e => set("commissionPct", parseFloat(e.target.value))}
                className="w-full accent-secondary"
              />
            </div>
            <div>
              <p className="font-manrope text-xs text-on-surface-variant mb-1">Minimum Listing Price ($)</p>
              <input
                type="number" min="0" step="0.5"
                value={config.minListingPrice}
                onChange={e => set("minListingPrice", parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-low rounded-2xl px-4 py-2.5 font-jakarta font-bold text-sm text-on-surface ghost-border focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-surface-lowest rounded-4xl p-5 shadow-ambient">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${config.maintenanceMode ? "gradient-primary" : "bg-surface-high"}`}>
              <span className={`material-icons ${config.maintenanceMode ? "text-white" : "text-on-surface-variant"}`} style={{ fontSize: 18 }}>construction</span>
            </div>
            <div className="flex-1">
              <h2 className="font-jakarta font-bold text-sm text-on-surface">Maintenance Mode</h2>
              <p className="font-manrope text-xs text-on-surface-variant">
                {config.maintenanceMode ? "Site is currently offline for users" : "Site is live and accepting traffic"}
              </p>
            </div>
            <button
              onClick={() => set("maintenanceMode", !config.maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition-all ${config.maintenanceMode ? "gradient-primary" : "bg-surface-high"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${config.maintenanceMode ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
          {config.maintenanceMode && (
            <div className="bg-primary/10 rounded-3xl p-3">
              <p className="font-manrope text-xs text-primary">
                ⚠️ Enabling maintenance mode will show a "Coming Soon" page to all non-admin users. Make sure to save after toggling.
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={isSaving}
          className={`w-full py-4 rounded-full font-jakarta font-extrabold text-base shadow-pink-glow disabled:opacity-60 transition-all ${saved ? "bg-secondary text-white" : "gradient-primary text-white"}`}
        >
          {isSaving ? "Saving…" : saved ? "✓ Saved!" : "Save Configuration"}
        </button>

        <div className="flex gap-2 flex-wrap pb-2">
          {["Cop it.", "Rare Drop.", "Trade Life."].map((t) => (
            <span key={t} className="font-jakarta font-extrabold text-xs gradient-primary-text">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
