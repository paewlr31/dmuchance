"use client"

import { FormEvent, useState } from "react"
import { Check } from "lucide-react"

const fieldClass = "w-full rounded-2xl border-2 border-[#d7ecc4] bg-white px-4 py-3 outline-none focus:border-[#1c7c3a]"

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState("")

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setStatus("sending")
    setError("")
    const response = await fetch("/api/kontakt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        consent: data.consent === "on",
      }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setStatus("error")
      setError(payload?.error || "Nie udało się wysłać wiadomości.")
      return
    }
    form.reset()
    setStatus("sent")
  }

  if (status === "sent") {
    return (
      <div className="rounded-[1.6rem] bg-[#f3fbe6] p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#ffe14d]">
          <Check />
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl">Wiadomość wysłana</h2>
        <p className="mt-2 text-sm text-[#4e6b5a]">Odezwiemy się na podany adres e-mail.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-[1.6rem] bg-white p-5 shadow-[0_12px_40px_rgba(20,92,50,0.08)] sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">Napisz do nas</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" placeholder="Imię i nazwisko" className={fieldClass} />
        <input required type="email" name="email" placeholder="E-mail" className={fieldClass} />
      </div>
      <input name="phone" placeholder="Telefon (opcjonalnie)" className={fieldClass} />
      <textarea required name="message" rows={5} placeholder="W czym możemy pomóc?" className={`${fieldClass} resize-y`} />
      <label className="flex items-start gap-2 text-sm text-[#4e6b5a]">
        <input required type="checkbox" name="consent" className="mt-1 accent-[#1c7c3a]" />
        Zgadzam się na kontakt w sprawie tej wiadomości.
      </label>
      {status === "error" && <p className="rounded-2xl bg-[#fff1cc] px-4 py-3 text-sm font-bold text-[#163024]">{error}</p>}
      <button disabled={status === "sending"} className="rounded-full bg-[#1c7c3a] px-6 py-3 font-extrabold text-white hover:bg-[#145c32] disabled:opacity-60">
        {status === "sending" ? "Wysyłanie..." : "Wyślij wiadomość"}
      </button>
    </form>
  )
}
