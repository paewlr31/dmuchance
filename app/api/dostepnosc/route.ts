import { NextResponse } from "next/server"
import { availabilityProblems } from "@/lib/orders"
import { getProduct } from "@/lib/products"
import type { PricedItem } from "@/lib/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const dateFrom = url.searchParams.get("from") ?? ""
  const dateTo = url.searchParams.get("to") ?? ""
  const items: PricedItem[] = (url.searchParams.get("items") ?? "")
    .split(",")
    .map((part) => {
      const [slug, qty] = part.split(":")
      const product = getProduct(slug ?? "")
      const count = Math.floor(Number(qty))
      if (!product || count < 1) return null
      return { slug: product.slug, sku: product.sku, name: product.name, qty: count, pricePerDay: product.pricePerDay, days: 1, lineTotal: 0 }
    })
    .filter((item) => item !== null)

  if (!dateFrom || !dateTo || items.length === 0) return NextResponse.json({ problems: [] })

  try {
    const problems = await availabilityProblems(items, dateFrom, dateTo)
    return NextResponse.json({ problems })
  } catch (error) {
    const text = error instanceof Error ? error.message : "Nie udało się sprawdzić terminu."
    return NextResponse.json({ problems: [text] })
  }
}
