"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useCart } from "@/components/cart-provider"
import { PageIntro } from "@/components/page-intro"
import { rentalDays } from "@/lib/booking"
import { eventTypes, formatPln, getProduct } from "@/lib/products"

const fieldClass = "w-full rounded-2xl border-2 border-[#d7ecc4] bg-white px-4 py-3 font-semibold outline-none focus:border-[#1c7c3a]"

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date())
}

export function CheckoutForm() {
  const { ready, items, clear } = useCart()
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [payEnabled, setPayEnabled] = useState(false)
  const [blocked, setBlocked] = useState("")
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo, setDateTo] = useState(today())
  const days = rentalDays(dateFrom, dateTo) ?? 0
  const lines = useMemo(
    () => items.map((item) => ({ ...item, product: getProduct(item.slug) })).filter((item) => item.product),
    [items],
  )
  const perDay = lines.reduce((sum, line) => sum + line.product!.pricePerDay * line.qty, 0)
  const total = days > 0 ? perDay * days : 0

  useEffect(() => {
    fetch("/api/platnosc")
      .then((response) => response.json())
      .then((data: { enabled?: boolean }) => setPayEnabled(Boolean(data.enabled)))
      .catch(() => setPayEnabled(false))
  }, [])

  useEffect(() => {
    if (days < 1 || lines.length === 0) {
      setBlocked("")
      return
    }
    const query = new URLSearchParams({
      from: dateFrom,
      to: dateTo,
      items: lines.map((line) => `${line.slug}:${line.qty}`).join(","),
    })
    const timer = window.setTimeout(() => {
      fetch(`/api/dostepnosc?${query}`)
        .then((response) => response.json())
        .then((data: { problems?: string[] }) => setBlocked(data.problems?.[0] ?? ""))
        .catch(() => setBlocked(""))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [dateFrom, dateTo, days, lines])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (blocked) return
    const form = new FormData(event.currentTarget)
    setSending(true)
    setError("")
    const response = await fetch("/api/platnosc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((line) => ({ slug: line.slug, qty: line.qty })),
        customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone") },
        event: {
          type: form.get("type"),
          dateFrom,
          dateTo,
          timeFrom: form.get("timeFrom"),
          timeTo: form.get("timeTo"),
          street: form.get("street"),
          postalCode: form.get("postalCode"),
          city: form.get("city"),
          notes: form.get("notes"),
          guests: form.get("guests"),
        },
        consent: form.get("consent") === "on",
        p24Consent: payEnabled && form.get("p24Consent") === "on",
      }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string; redirectUrl?: string; sent?: boolean } | null
    if (payload?.redirectUrl) {
      window.location.href = payload.redirectUrl
      return
    }
    if (response.ok && payload?.sent) {
      clear()
      setDone(true)
      setSending(false)
      return
    }
    setSending(false)
    setError(payload?.error || "Nie udało się wysłać zamówienia.")
  }

  if (done) {
    return (
      <div className="mt-8 rounded-[1.6rem] bg-[#f3fbe6] p-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Zamówienie wysłane</h2>
        <p className="mt-3 text-[#4e6b5a]">Dostaliśmy dane imprezy i kontakt. Płatność online jest na razie wyłączona, odezwiemy się w sprawie terminu.</p>
        <Link href="/dmuchance" className="mt-6 inline-flex rounded-full bg-[#ffe14d] px-5 py-3 font-extrabold text-[#163024]">
          Wróć do dmuchańców
        </Link>
      </div>
    )
  }

  if (!ready) return <p className="mt-8 text-[#4e6b5a]">Wczytuję zamówienie...</p>
  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-[1.6rem] bg-[#f3fbe6] p-8">
        <p className="font-extrabold">Najpierw dodaj dmuchańca do koszyka.</p>
        <Link href="/dmuchance" className="mt-4 inline-flex font-extrabold text-[#1c7c3a]">
          Wróć do oferty
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-4 rounded-[1.6rem] bg-white p-5 sm:p-7">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Dane do kontaktu</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-extrabold">
            Imię i nazwisko
            <input required name="name" autoComplete="name" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Telefon
            <input required name="phone" autoComplete="tel" inputMode="tel" placeholder="np. 600 000 000" className={fieldClass} />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-extrabold">
          E-mail
          <input required type="email" name="email" autoComplete="email" className={fieldClass} />
        </label>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">Impreza i dostawa</h2>
        <label className="grid gap-2 text-sm font-extrabold">
          Rodzaj imprezy
          <select required name="type" defaultValue="Urodziny" className={fieldClass}>
            {eventTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-extrabold">
            Data od
            <input
              required
              type="date"
              name="dateFrom"
              min={today()}
              value={dateFrom}
              onChange={(event) => {
                const value = event.target.value
                setDateFrom(value)
                if (dateTo < value) setDateTo(value)
              }}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Data do
            <input required type="date" name="dateTo" min={dateFrom || today()} value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Godzina dostawy
            <input required type="time" name="timeFrom" defaultValue="10:00" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Godzina odbioru
            <input required type="time" name="timeTo" defaultValue="18:00" className={fieldClass} />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-extrabold">
          Ulica i numer
          <input required name="street" autoComplete="street-address" className={fieldClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <label className="grid gap-2 text-sm font-extrabold">
            Kod pocztowy
            <input required name="postalCode" autoComplete="postal-code" placeholder="00-000" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Miejscowość
            <input required name="city" autoComplete="address-level2" className={fieldClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-extrabold">
            Liczba dzieci (opcjonalnie)
            <input name="guests" inputMode="numeric" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-extrabold">
            Uwagi (opcjonalnie)
            <input name="notes" placeholder="Brama, prąd, piętro" className={fieldClass} />
          </label>
        </div>
        <label className="flex items-start gap-2 text-sm text-[#4e6b5a]">
          <input required type="checkbox" name="consent" className="mt-1 accent-[#1c7c3a]" />
          <span>
            Akceptuję zasady z zakładki{" "}
            <Link href="/zamowienia-i-zwroty" className="font-extrabold text-[#1c7c3a] underline">
              Zamówienia i zwroty
            </Link>
            .
          </span>
        </label>
        {payEnabled ? (
          <label className="flex items-start gap-2 text-sm text-[#4e6b5a]">
            <input required type="checkbox" name="p24Consent" className="mt-1 accent-[#1c7c3a]" />
            <span>
              Oświadczam, że zapoznałem się z{" "}
              <a className="font-extrabold text-[#1c7c3a] underline" href="https://www.przelewy24.pl/regulamin" target="_blank" rel="noreferrer">
                regulaminem
              </a>{" "}
              i{" "}
              <a className="font-extrabold text-[#1c7c3a] underline" href="https://www.przelewy24.pl/obowiazekinformacyjny" target="_blank" rel="noreferrer">
                obowiązkiem informacyjnym
              </a>{" "}
              serwisu Przelewy24.
            </span>
          </label>
        ) : null}
        {blocked ? <p className="rounded-2xl bg-[#fff1cc] px-4 py-3 text-sm font-bold">{blocked}</p> : null}
        {error ? <p className="rounded-2xl bg-[#fff1cc] px-4 py-3 text-sm font-bold">{error}</p> : null}
        <button disabled={sending || days < 1 || Boolean(blocked)} className="rounded-full bg-[#1c7c3a] px-6 py-4 font-extrabold text-white hover:bg-[#145c32] disabled:opacity-60">
          {sending ? "Wysyłam..." : payEnabled ? "Zapłać przez Przelewy24" : "Wyślij zamówienie"}
        </button>
      </div>
      <aside className="h-fit rounded-[1.6rem] bg-[#145c32] p-6 text-white lg:sticky lg:top-28">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Do zapłaty</h2>
        <ul className="mt-4 grid gap-2 text-sm text-[#d7f5c4]">
          {lines.map((line) => (
            <li key={line.slug}>
              {line.product!.name} × {line.qty}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">Dni wynajmu: {days || "—"}</p>
        <p className="mt-2 text-3xl font-extrabold text-[#ffe14d]">{days > 0 ? formatPln(total) : "—"}</p>
        <p className="mt-3 text-xs leading-relaxed text-[#d7f5c4]">
          {payEnabled
            ? "Płatność otworzy się na stronie Przelewy24. Po wpłacie wrócisz tutaj, a my dostaniemy maila ze szczegółami."
            : "Płatność online jest wyłączona. Zamówienie przyjdzie do nas mailem. Przelewy24 włączymy, gdy klient założy konto."}
        </p>
      </aside>
    </form>
  )
}

export function CheckoutIntro() {
  return <PageIntro eyebrow="Zamówienie" title="Gdzie i na kiedy?" text="E-mail i telefon są obowiązkowe. Po wysłaniu dostaniemy te dane mailem." />
}
