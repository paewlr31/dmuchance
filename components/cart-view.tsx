"use client"

import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { PageIntro } from "@/components/page-intro"
import { useCart } from "@/components/cart-provider"
import { formatPln, getProduct } from "@/lib/products"

export function CartView() {
  const { ready, items, setQty, remove } = useCart()
  const lines = items.map((item) => ({ ...item, product: getProduct(item.slug) })).filter((item) => item.product)
  const total = lines.reduce((sum, line) => sum + line.product!.pricePerDay * line.qty, 0)

  return (
    <>
      <PageIntro eyebrow="Twoje zamówienie" title={ready ? `Koszyk (${lines.length})` : "Koszyk"} text="Możesz zebrać kilka dmuchańców. Ostateczna kwota zależy też od liczby dni, które podasz w następnym kroku." />
      {!ready ? <p className="mt-8 text-[#4e6b5a]">Wczytuję koszyk...</p> : null}
      {ready && lines.length === 0 ? (
        <div className="mt-8 rounded-[1.6rem] bg-[#f3fbe6] p-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Koszyk jest pusty</h2>
          <Link href="/dmuchance" className="mt-5 inline-flex rounded-full bg-[#ffe14d] px-5 py-3 font-extrabold text-[#163024]">
            Przejdź do dmuchańców
          </Link>
        </div>
      ) : null}
      {ready && lines.length > 0 ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-3">
            {lines.map((line) => (
              <div key={line.slug} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#d7ecc4] bg-white p-3">
                <img src={line.product!.image} alt="" className="size-20 rounded-xl object-cover" />
                <div className="min-w-[140px] flex-1">
                  <Link href={`/dmuchance/${line.slug}`} className="font-extrabold hover:text-[#1c7c3a]">
                    {line.product!.name}
                  </Link>
                  <p className="text-sm text-[#5d7a68]">{formatPln(line.product!.pricePerDay)} za dzień</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Mniej" className="rounded-full border border-[#d7ecc4] p-2" onClick={() => setQty(line.slug, line.qty - 1)}>
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-extrabold">{line.qty}</span>
                  <button type="button" aria-label="Więcej" className="rounded-full border border-[#d7ecc4] p-2" onClick={() => setQty(line.slug, line.qty + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <b className="w-24 text-right">{formatPln(line.product!.pricePerDay * line.qty)}</b>
                <button type="button" aria-label={`Usuń ${line.product!.name}`} className="rounded-full p-2 text-[#5d7a68] hover:bg-[#fff1cc]" onClick={() => remove(line.slug)}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-[1.6rem] bg-[#145c32] p-6 text-white">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Za 1 dzień</h2>
            <p className="mt-4 text-3xl font-extrabold text-[#ffe14d]">{formatPln(total)}</p>
            <p className="mt-2 text-sm text-[#d7f5c4]">Przy dłuższym terminie kwota pomnoży się przez liczbę dni.</p>
            <Link href="/zamowienie" className="mt-6 block rounded-full bg-[#ffe14d] px-5 py-3 text-center font-extrabold text-[#163024]">
              Dalej: dane imprezy
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  )
}
