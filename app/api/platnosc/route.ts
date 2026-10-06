import { NextResponse } from "next/server"
import { validateCheckout, type CheckoutInput } from "@/lib/booking"
import { availabilityProblems, newSessionId, saveOrder, type StoredOrder } from "@/lib/orders"
import { p24Config, registerTransaction, requestOrigin } from "@/lib/p24"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutInput | null
  if (!body) return NextResponse.json({ error: "Brak danych zamówienia." }, { status: 400 })

  const { errors, order } = validateCheckout(body)
  if (errors.length > 0) return NextResponse.json({ error: errors[0] }, { status: 400 })

  const config = p24Config()
  if (config.missing.length > 0) {
    return NextResponse.json(
      { error: `Płatność nie jest jeszcze podłączona. Brakuje: ${config.missing.join(", ")}.` },
      { status: 503 },
    )
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM || !process.env.ORDER_NOTIFY_EMAIL) {
    return NextResponse.json(
      { error: "Płatność czeka na skrzynkę powiadomień. Uzupełnij Resend i ORDER_NOTIFY_EMAIL." },
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
      status: "pending",
      emailSent: false,
      ...order,
    }
    await saveOrder(stored)

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
