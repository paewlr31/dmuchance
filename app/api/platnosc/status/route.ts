import { NextResponse } from "next/server"
import { readOrder } from "@/lib/orders"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sid") ?? ""
  const order = await readOrder(sessionId)
  if (!order) return NextResponse.json({ status: "missing" })
  return NextResponse.json({ status: order.status })
}
