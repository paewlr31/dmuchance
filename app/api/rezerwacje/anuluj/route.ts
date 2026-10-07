import { NextResponse } from "next/server"
import { sendCancellationToOwner } from "@/lib/mail"
import { cancelByToken } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null
  const token = body?.token ?? ""
  try {
    const result = await cancelByToken(token)
    if (!result) return NextResponse.json({ error: "Nie ma takiej rezerwacji." }, { status: 404 })
    if (result.changed) await sendCancellationToOwner(result.order).catch(() => undefined)
    return NextResponse.json({ ok: true, status: result.order.status })
  } catch (error) {
    const text = error instanceof Error ? error.message : "Nie udało się anulować rezerwacji."
    return NextResponse.json({ error: text }, { status: 500 })
  }
}
