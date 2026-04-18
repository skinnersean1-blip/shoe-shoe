"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string           // shoe id
  brand: string
  size: string
  condition: string
  price: number
  creditValue: number
  images: string
  paymentType: "cash" | "credits"
}

interface CartContextValue {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
  cashTotal: number
  creditsTotal: number
  count: number
}

const CartContext = createContext<CartContextValue>({
  items: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
  cashTotal: 0,
  creditsTotal: 0,
  count: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("up_cart")
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    try { localStorage.setItem("up_cart", JSON.stringify(next)) } catch {}
  }

  const add = (item: CartItem) => {
    persist([...items.filter((i) => i.id !== item.id), item])
  }

  const remove = (id: string) => persist(items.filter((i) => i.id !== id))

  const clear = () => persist([])

  const cashItems    = items.filter((i) => i.paymentType === "cash")
  const creditsItems = items.filter((i) => i.paymentType === "credits")
  const cashTotal    = cashItems.reduce((s, i) => s + i.price, 0)
  const creditsTotal = creditsItems.reduce((s, i) => s + i.creditValue, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, clear, cashTotal, creditsTotal, count: items.length }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
