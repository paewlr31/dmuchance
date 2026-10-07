import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductPurchase } from "@/components/add-to-cart"
import { formatRange } from "@/lib/dates"
import { bookingsForProduct } from "@/lib/orders"
import { formatMeters, formatPln, getProduct, products, sharedFacts } from "@/lib/products"

export const dynamic = "force-dynamic"

type Params = { slug: string }

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: "Dmuchaniec" }
  return { title: product.name, description: product.summary }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()
  const booked = await bookingsForProduct(product.slug)

  const facts = [
    ["Wymiary", formatMeters(product.size)],
    ["Waga", `${product.weightKg} kg`],
    ["Paczka", formatMeters(product.packageSize)],
    ["W ofercie", `${product.stock} szt.`],
    ["Model", product.sku],
    ["Cena", `${formatPln(product.pricePerDay)} za dzień`],
  ]

  return (
    <article className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
      <img src={product.image} alt={product.name} className="w-full rounded-[2rem] bg-[#fff4c2] object-cover" />
      <div>
        <Link href="/dmuchance" className="text-sm font-extrabold text-[#1c7c3a]">
          ← Wszystkie dmuchańce
        </Link>
        <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.16em] text-[#1c7c3a]">{product.category}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#163024] sm:text-5xl">{product.name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#4e6b5a]">{product.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white px-4 py-3">
              <dt className="text-xs font-extrabold uppercase tracking-wide text-[#5d7a68]">{label}</dt>
              <dd className="mt-1 font-extrabold text-[#163024]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-[1.4rem] bg-white p-4">
          <h2 className="font-extrabold">Zajęte terminy</h2>
          {booked.length === 0 ? (
            <p className="mt-2 text-sm text-[#4e6b5a]">Na najbliższy czas ten dmuchaniec nie ma rezerwacji.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm font-bold text-[#9a4d16]">
              {booked.map((slot) => (
                <li key={`${slot.from}-${slot.to}-${slot.qty}`}>
                  {formatRange(slot.from, slot.to)} · {slot.qty >= slot.stock ? "zajęty, nie da się wynająć" : `zajęte ${slot.qty} z ${slot.stock} szt.`}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6">
          <ProductPurchase slug={product.slug} stock={product.stock} />
        </div>
        <ul className="mt-6 grid gap-2 text-sm leading-relaxed text-[#4e6b5a]">
          {sharedFacts.map((fact) => (
            <li key={fact}>• {fact}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
