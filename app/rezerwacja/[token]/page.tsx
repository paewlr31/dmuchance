import type { Metadata } from "next"
import { CancelReservation } from "@/components/cancel-reservation"
import { formatRange } from "@/lib/dates"
import { findByCancelToken } from "@/lib/orders"
import { formatPln } from "@/lib/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Anulowanie rezerwacji",
}

export default async function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const order = await findByCancelToken(token)

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#1c7c3a]">Rezerwacja</p>
      {!order ? <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Nie ma takiej rezerwacji</h1> : null}
      {order ? (
        <>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#163024]">{order.customer.name}</h1>
          <p className="mt-4 text-[#4e6b5a]">
            {formatRange(order.event.dateFrom, order.event.dateTo)} · {order.event.city} · {formatPln(order.totalPln)}
          </p>
          <ul className="mt-4 grid gap-1 font-bold">
            {order.items.map((item) => (
              <li key={item.slug}>
                {item.name} × {item.qty}
              </li>
            ))}
          </ul>
          <CancelReservation token={token} cancelled={order.status === "cancelled"} />
        </>
      ) : null}
    </section>
  )
}
