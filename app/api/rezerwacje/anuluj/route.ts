import { NextResponse } from "next/server"
import { cancelByToken } from "@/lib/orders"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null
  const token = body?.token ?? ""
  try {
    const order = await cancelByToken(token)
    if (!order) return NextResponse.json({ error: "Nie ma takiej rezerwacji." }, { status: 404 })
    return NextResponse.json({ ok: true, status: order.status })
  } catch (error) {
    const text = error instanceof Error ? error.message : "Nie udało się anulować rezerwacji."
    return NextResponse.json({ error: text }, { status: 500 })
  }
}
