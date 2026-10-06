"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useCart } from "@/components/cart-provider"

export function PaymentReturn({ sessionId }: { sessionId: string }) {
  const { clear } = useCart()
  const clearRef = useRef(clear)
  clearRef.current = clear
  const [status, setStatus] = useState<"pending" | "paid" | "missing">("pending")

  useEffect(() => {
    if (!sessionId) {
      setStatus("missing")
      return
    }
    let stopped = false
    let attempts = 0
    let cleared = false

    async function check() {
      const response = await fetch(`/api/platnosc/status?sid=${encodeURIComponent(sessionId)}`)
      const payload = (await response.json().catch(() => null)) as { status?: "pending" | "paid" | "missing" } | null
      if (stopped) return
      const next = payload?.status ?? "missing"
      setStatus(next)
      if (next === "paid") {
        if (!cleared) {
          cleared = true
          clearRef.current()
        }
        return
      }
      attempts += 1
      if (next === "pending" && attempts < 12) {
        window.setTimeout(check, 3000)
      }
    }

    void check()
    return () => {
      stopped = true
    }
  }, [sessionId])

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#1c7c3a]">Płatność</p>
      {status === "paid" ? (
        <>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#163024]">Płatność przyjęta</h1>
          <p className="mt-4 text-lg text-[#4e6b5a]">Dziękujemy. Mamy już dane imprezy i kontakt do Ciebie. Jeśli coś będzie trzeba doprecyzować, odezwiemy się.</p>
        </>
      ) : null}
      {status === "pending" ? (
        <>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#163024]">Czekamy na potwierdzenie</h1>
          <p className="mt-4 text-lg text-[#4e6b5a]">Przelewy24 jeszcze przekazuje wynik płatności. Ta strona odświeży się sama. Możesz ją też zostawić — potwierdzenie i tak do nas dotrze.</p>
        </>
      ) : null}
      {status === "missing" ? (
        <>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#163024]">Nie znaleziono zamówienia</h1>
          <p className="mt-4 text-lg text-[#4e6b5a]">Jeśli płatność została pobrana, napisz do nas i podaj godzinę przelewu.</p>
        </>
      ) : null}
      <Link href="/" className="mt-8 inline-flex rounded-full bg-[#ffe14d] px-5 py-3 font-extrabold text-[#163024]">
        Wróć na stronę główną
      </Link>
    </section>
  )
}
