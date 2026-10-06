"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getProduct } from "@/lib/products"

export type CartLine = { slug: string; qty: number }

type CartContextValue = {
  ready: boolean
  items: CartLine[]
  count: number
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const storageKey = "dmuchance-koszyk"

function sanitize(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []
  const items: CartLine[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue
    const slug = "slug" in entry && typeof entry.slug === "string" ? entry.slug : ""
    const product = getProduct(slug)
    const qty = "qty" in entry ? Math.floor(Number(entry.qty)) : 0
    if (!product || qty < 1) continue
    items.push({ slug, qty: Math.min(product.stock, qty) })
  }
  return items
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setItems(sanitize(JSON.parse(localStorage.getItem(storageKey) ?? "[]")))
    } catch {
      setItems([])
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, ready])

  const value = useMemo<CartContextValue>(() => {
    return {
      ready,
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      add: (slug, qty = 1) => {
        const product = getProduct(slug)
        if (!product) return
        setItems((current) => {
          const existing = current.find((item) => item.slug === slug)
          const nextQty = Math.min(product.stock, (existing?.qty ?? 0) + qty)
          if (nextQty < 1) return current
          if (!existing) return [...current, { slug, qty: nextQty }]
          return current.map((item) => (item.slug === slug ? { slug, qty: nextQty } : item))
        })
      },
      setQty: (slug, qty) => {
        const product = getProduct(slug)
        if (!product) return
        setItems((current) => {
          if (qty < 1) return current.filter((item) => item.slug !== slug)
          return current.map((item) => (item.slug === slug ? { slug, qty: Math.min(product.stock, qty) } : item))
        })
      },
      remove: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)),
      clear: () => setItems([]),
    }
  }, [items, ready])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("Koszyk jest niedostępny.")
  return context
}
