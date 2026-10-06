import { NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/mail"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string
    email?: string
    phone?: string
    message?: string
    consent?: boolean
  } | null

  const name = body?.name?.trim().slice(0, 80) ?? ""
  const email = body?.email?.trim().slice(0, 80) ?? ""
  const phone = body?.phone?.trim().slice(0, 30) ?? ""
  const message = body?.message?.trim().slice(0, 4000) ?? ""

  if (name.length < 2) return NextResponse.json({ error: "Podaj imię i nazwisko." }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Podaj prawidłowy e-mail." }, { status: 400 })
  if (message.length < 5) return NextResponse.json({ error: "Wiadomość jest za krótka." }, { status: 400 })
  if (!body?.consent) return NextResponse.json({ error: "Zaznacz zgodę na kontakt." }, { status: 400 })

  try {
    await sendContactEmail({ name, email, phone, message })
  } catch (error) {
    const text = error instanceof Error ? error.message : "Nie udało się wysłać wiadomości."
    return NextResponse.json({ error: text }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
