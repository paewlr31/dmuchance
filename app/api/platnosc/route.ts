import { NextResponse } from "next/server"
import { validateCheckout, type CheckoutInput } from "@/lib/booking"
import { sendOrderEmail } from "@/lib/mail"
import { availabilityProblems, newSessionId, ordersCanBeSaved, saveOrder, type StoredOrder } from "@/lib/orders"
import { p24Config, registerTransaction, requestOrigin } from "@/lib/p24"

export const runtime = "nodejs"

export async function GET() {
  const config = p24Config()
  return NextResponse.json({ enabled: config.missing.length === 0 })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutInput | null
  if (!body) return NextResponse.json({ error: "Brak danych zamówienia." }, { status: 400 })

  const config = p24Config()
  const paymentOn = config.missing.length === 0
  const { errors, order } = validateCheckout(body, { requireP24: paymentOn })
  if (errors.length > 0) return NextResponse.json({ error: errors[0] }, { status: 400 })

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM || !process.env.ORDER_NOTIFY_EMAIL) {
    return NextResponse.json(
      { error: "Brak skrzynki na zamówienia. Uzupełnij Resend i ORDER_NOTIFY_EMAIL." },
      { status: 503 },
    )
  }

  try {
    const problems = await availabilityProblems(order.items, order.event.dateFrom, order.event.dateTo)
    if (problems.length > 0) return NextResponse.json({ error: problems[0] }, { status: 409 })

    const sessionId = newSessionId()
    const stored: StoredOrder = {
      sessionId,
      createdAt: new Date().toISOString(),
      status: paymentOn ? "pending" : "received",
      emailSent: false,
      ...order,
    }
    const persist = ordersCanBeSaved()
    if (persist) await saveOrder(stored)

    if (!paymentOn) {
      await sendOrderEmail(stored)
      if (persist) {
        stored.emailSent = true
        await saveOrder(stored)
      }
      return NextResponse.json({ sent: true })
    }

    if (!persist) {
      return NextResponse.json({ error: "Płatność wymaga magazynu zamówień." }, { status: 503 })
    }

    const origin = requestOrigin(request)
    const names = order.items.map((item) => item.name).join(", ")
    const redirectUrl = await registerTransaction({
      sessionId,
      amount: order.amountGrosze,
      description: `Wynajem dmuchańców: ${names}`.slice(0, 1024),
      email: order.customer.email,
      client: order.customer.name,
      address: order.event.street,
      zip: order.event.postalCode,
      city: order.event.city,
      phone: `48${order.customer.phone}`,
      urlReturn: `${origin}/zamowienie/powrot?sid=${sessionId}`,
      urlStatus: `${origin}/api/platnosc/przelewy24`,
    })

    return NextResponse.json({ redirectUrl })
  } catch (error) {
    const text = error instanceof Error ? error.message : "Nie udało się utworzyć płatności."
    return NextResponse.json({ error: text }, { status: 502 })
  }
}
