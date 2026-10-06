import Link from "next/link"
import { formatMeters, formatPln, type Product } from "@/lib/products"
import { AddToCartButton } from "@/components/add-to-cart"

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[1.6rem] border border-[#d7ecc4] bg-white shadow-[0_10px_30px_rgba(20,92,50,0.06)]">
      <Link href={`/dmuchance/${product.slug}`} className="relative block bg-[#fff4c2]">
        <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-[#ffe14d] px-3 py-1 text-xs font-extrabold text-[#163024]">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[#163024]">
            <Link href={`/dmuchance/${product.slug}`}>{product.name}</Link>
          </h2>
          <p className="whitespace-nowrap text-right font-extrabold text-[#1c7c3a]">
            {formatPln(product.pricePerDay)}
            <span className="block text-[11px] font-bold text-[#5d7a68]">za dzień</span>
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#4e6b5a]">{product.summary}</p>
        <p className="mt-3 text-xs font-bold text-[#5d7a68]">
          {formatMeters(product.size)} · {product.stock} szt. w ofercie
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e7f5d8] pt-4">
          <Link href={`/dmuchance/${product.slug}`} className="text-sm font-extrabold text-[#1c7c3a] underline-offset-4 hover:underline">
            Zobacz szczegóły
          </Link>
          <AddToCartButton slug={product.slug} />
        </div>
      </div>
    </article>
  )
}
