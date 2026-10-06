import { NextResponse } from "next/server"
import { sendOrderEmail } from "@/lib/mail"
import { readOrder, saveOrder } from "@/lib/orders"
import { p24Config, p24Sign, signaturesMatch, verifyTransaction } from "@/lib/p24"

export const runtime = "nodejs"

type Notice = {
  merchantId?: number
  posId?: number
  sessionId?: string
  amount?: number
  originAmount?: number
  currency?: string
  orderId?: number
  methodId?: number
  statement?: string
  sign?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Notice | null
  const config = p24Config()
  if (!body?.sessionId || !body.sign || config.missing.length > 0) {
    return NextResponse.json({ error: "Nieprawidłowe powiadomienie." }, { status: 400 })
  }

  const longSign = p24Sign({
    merchantId: Number(body.merchantId),
    posId: Number(body.posId),
    sessionId: String(body.sessionId),
    amount: Number(body.amount),
    originAmount: Number(body.originAmount),
    currency: String(body.currency),
    orderId: Number(body.orderId),
    methodId: Number(body.methodId),
    statement: String(body.statement ?? ""),
    crc: config.crc,
  })
  const shortSign = p24Sign({
    sessionId: String(body.sessionId),
    orderId: Number(body.orderId),
    amount: Number(body.amount),
    currency: String(body.currency),
    crc: config.crc,
  })

  if (!signaturesMatch(body.sign, longSign) && !signaturesMatch(body.sign, shortSign)) {
    return NextResponse.json({ error: "Zły podpis płatności." }, { status: 400 })
  }

  const order = await readOrder(body.sessionId)
  if (!order) return NextResponse.json({ error: "Nie ma takiego zamówienia." }, { status: 404 })
  if (Number(body.amount) !== order.amountGrosze) {
    return NextResponse.json({ error: "Kwota nie zgadza się z zamówieniem." }, { status: 400 })
  }

  if (order.status !== "paid") {
    const verified = await verifyTransaction({
      sessionId: order.sessionId,
      amount: order.amountGrosze,
      orderId: Number(body.orderId),
    })
    if (!verified) return NextResponse.json({ error: "Przelewy24 nie potwierdził wpłaty." }, { status: 400 })
    order.status = "paid"
    order.p24OrderId = Number(body.orderId)
    await saveOrder(order)
  }

  if (!order.emailSent) {
    try {
      await sendOrderEmail(order)
      order.emailSent = true
      await saveOrder(order)
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Mail z zamówieniem nie wyszedł." }, { status: 500 })
    }
  }

  return NextResponse.json({ status: "ok" })
}
