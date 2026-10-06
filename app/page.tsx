import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export const metadata: Metadata = {
  title: "Dmuchańce na imprezy",
  description: "Wynajem siedmiu dmuchańców na urodziny i inne imprezy. Wybierz atrakcję, podaj termin i adres, zapłać online.",
}

const highlights = ["zamek-wrozek", "statek-piratow", "podwojna-zjezdzalnia"]

export default function HomePage() {
  const featured = highlights.map((slug) => products.find((product) => product.slug === slug)).filter((product) => product != null)

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-[#ffe14d] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#163024]">
            Zabawa na wynajem
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-[#163024] sm:text-6xl">
            Dmuchańce, które robią imprezę
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#4e6b5a]">
            W ofercie jest siedem atrakcji: zamki i zjeżdżalnie. Wybierasz modele, podajesz kontakt, adres i termin, a zamówienie przychodzi do nas mailem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dmuchance" className="inline-flex items-center gap-2 rounded-full bg-[#ffe14d] px-6 py-3 font-extrabold text-[#163024] shadow-[3px_3px_0_#163024]">
              Zobacz dmuchańce <ArrowRight size={18} />
            </Link>
            <Link href="/o-firmie" className="rounded-full border-2 border-[#163024] px-6 py-3 font-extrabold">
              O firmie
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-2 -top-4 z-10 rotate-3 rounded-2xl bg-[#ffe14d] px-4 py-3 text-center font-extrabold shadow-[3px_3px_0_#163024]">
            <span className="block font-[family-name:var(--font-display)] text-3xl">7</span>
            <span className="text-xs uppercase">atrakcji</span>
          </div>
          <img
            src="/produkty/zamek-wrozek.jpg"
            alt="Kolorowy zamek dmuchany z wieżyczkami i zjeżdżalnią"
            className="h-[420px] w-full rounded-[2rem] border-4 border-white object-cover shadow-[8px_8px_0_#1c7c3a]"
          />
        </div>
      </section>
      <section className="bg-[#e7f8cf] px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 text-center text-sm font-extrabold text-[#145c32]">
          <span>Dowóz pod adres imprezy</span>
          <span>Kilka atrakcji w jednym zamówieniu</span>
          <span>Zamówienie mailem</span>
          <span>Kontakt mail i telefon przy zamówieniu</span>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#163024] sm:text-4xl">Z tej kolekcji</h2>
          <Link href="/dmuchance" className="font-extrabold text-[#1c7c3a]">
            Wszystkie
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
