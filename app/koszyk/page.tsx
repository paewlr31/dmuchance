import type { Metadata } from "next"
import { CartView } from "@/components/cart-view"

export const metadata: Metadata = {
  title: "Koszyk",
  description: "Wybrane dmuchańce i przejście do zamówienia.",
}

export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <CartView />
    </section>
  )
}
