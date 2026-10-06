"use client"

import Link from "next/link"
import { useState } from "react"
import { getProduct } from "@/lib/products"
import { useCart } from "@/components/cart-provider"

export function AddToCartButton({ slug }: { slug: string }) {
  const product = getProduct(slug)
  const { items, add } = useCart()
  const inCart = items.find((item) => item.slug === slug)?.qty ?? 0
  if (!product) return null
  const full = inCart >= product.stock

  return (
    <button
      type="button"
      disabled={full}
      onClick={() => add(slug, 1)}
      className="rounded-full bg-[#163024] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#1c7c3a] disabled:cursor-not-allowed disabled:bg-[#c9d8c4] disabled:text-[#163024]"
    >
      {full ? "Limit sztuk" : inCart > 0 ? "Dodaj kolejną" : "Do koszyka"}
    </button>
  )
}

export function ProductPurchase({ slug, stock }: { slug: string; stock: number }) {
  const { items, add } = useCart()
  const inCart = items.find((item) => item.slug === slug)?.qty ?? 0
  const maxAdd = Math.max(1, stock - inCart)
  const [qty, setQty] = useState(1)
  const full = inCart >= stock

  return (
    <div className="rounded-[1.6rem] bg-[#f3fbe6] p-5">
      {full ? (
        <p className="font-extrabold text-[#163024]">W koszyku jest już maksymalna liczba sztuk.</p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-2 text-sm font-extrabold text-[#163024]">
            Liczba sztuk
            <input
              type="number"
              min={1}
              max={maxAdd}
              value={qty}
              onChange={(event) => setQty(Math.max(1, Math.min(maxAdd, Number(event.target.value) || 1)))}
              className="w-24 rounded-2xl border-2 border-[#d7ecc4] bg-white px-3 py-3 text-base font-bold outline-none focus:border-[#1c7c3a]"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              add(slug, qty)
              setQty(1)
            }}
            className="rounded-full bg-[#ffe14d] px-5 py-3 font-extrabold text-[#163024] shadow-[3px_3px_0_#163024] hover:translate-y-px hover:shadow-[1px_1px_0_#163024]"
          >
            Dodaj do koszyka
          </button>
        </div>
      )}
      <p className="mt-3 text-sm text-[#4e6b5a]">
        W koszyku: {inCart} z {stock} szt.{" "}
        <Link href="/koszyk" className="font-extrabold text-[#1c7c3a] underline-offset-4 hover:underline">
          Przejdź do koszyka
        </Link>
      </p>
    </div>
  )
}
