import { eventTypes, getProduct, type EventType } from "@/lib/products"

export type CheckoutItem = { slug: string; qty: number }

export type CheckoutInput = {
  items: CheckoutItem[]
  customer: { name: string; email: string; phone: string }
  event: {
    type: string
    dateFrom: string
    dateTo: string
    timeFrom: string
    timeTo: string
    street: string
    postalCode: string
    city: string
    notes: string
    guests: string
  }
  consent: boolean
  p24Consent: boolean
}

export type PricedItem = {
  slug: string
  sku: string
  name: string
  qty: number
  pricePerDay: number
  days: number
  lineTotal: number
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export function warsawToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date())
}

export function rentalDays(dateFrom: string, dateTo: string) {
  if (!datePattern.test(dateFrom) || !datePattern.test(dateTo) || dateTo < dateFrom) return null
  const start = Date.parse(`${dateFrom}T00:00:00Z`)
  const end = Date.parse(`${dateTo}T00:00:00Z`)
  const days = Math.round((end - start) / 86_400_000) + 1
  if (days < 1 || days > 14) return null
  return days
}

export function rangesOverlap(fromA: string, toA: string, fromB: string, toB: string) {
  return fromA <= toB && fromB <= toA
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export function validateCheckout(input: CheckoutInput, options?: { requireP24?: boolean }) {
  const errors: string[] = []
  const name = clean(input.customer?.name, 40)
  const email = clean(input.customer?.email, 50)
  const phoneRaw = clean(input.customer?.phone, 20)
  const phoneDigits = phoneRaw.replace(/\D/g, "")
  const type = clean(input.event?.type, 40)
  const dateFrom = clean(input.event?.dateFrom, 10)
  const dateTo = clean(input.event?.dateTo, 10)
  const timeFrom = clean(input.event?.timeFrom, 5)
  const timeTo = clean(input.event?.timeTo, 5)
  const street = clean(input.event?.street, 80)
  const postalCode = clean(input.event?.postalCode, 10)
  const city = clean(input.event?.city, 50)
  const notes = clean(input.event?.notes, 500)
  const guests = clean(input.event?.guests, 4)

  if (name.length < 3) errors.push("Podaj imię i nazwisko.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Podaj prawidłowy adres e-mail.")
  const phoneOk =
    phoneDigits.length === 9 || (phoneDigits.length === 11 && phoneDigits.startsWith("48"))
  if (!phoneOk) errors.push("Podaj numer telefonu: 9 cyfr albo numer z kierunkowym 48.")
  if (!eventTypes.includes(type as EventType)) errors.push("Wybierz rodzaj imprezy.")
  if (dateFrom < warsawToday()) errors.push("Data rozpoczęcia nie może być z przeszłości.")
  const days = rentalDays(dateFrom, dateTo)
  if (!days) errors.push("Podaj poprawny zakres dat. Wynajem może trwać od 1 do 14 dni.")
  if (!timePattern.test(timeFrom) || !timePattern.test(timeTo)) {
    errors.push("Podaj godzinę dostawy i odbioru.")
  } else if (days === 1 && timeTo <= timeFrom) {
    errors.push("Godzina odbioru musi być późniejsza niż godzina dostawy.")
  }
  if (street.length < 3) errors.push("Podaj ulicę i numer miejsca dostawy.")
  if (!/^\d{2}-\d{3}$/.test(postalCode)) errors.push("Kod pocztowy zapisz w formacie 00-000.")
  if (city.length < 2) errors.push("Podaj miejscowość.")
  if (guests && !/^\d{1,4}$/.test(guests)) errors.push("Liczba dzieci musi być liczbą.")
  if (!input.consent) errors.push("Zaakceptuj zasady zamówienia i zwrotów.")
  if (options?.requireP24 !== false && !input.p24Consent) errors.push("Zaakceptuj regulamin Przelewy24.")

  const rawItems = Array.isArray(input.items) ? input.items : []
  const priced: PricedItem[] = []
  if (rawItems.length === 0) errors.push("Koszyk jest pusty.")
  if (rawItems.length > 7) errors.push("W jednym zamówieniu można dodać najwyżej siedem pozycji.")

  for (const item of rawItems) {
    const product = getProduct(clean(item?.slug, 80))
    const qty = Math.floor(Number(item?.qty))
    if (!product) {
      errors.push("W koszyku jest nieznany dmuchaniec.")
      continue
    }
    if (!Number.isFinite(qty) || qty < 1) {
      errors.push(`Podaj liczbę sztuk dla: ${product.name}.`)
      continue
    }
    if (qty > product.stock) {
      errors.push(`${product.name}: dostępne są najwyżej ${product.stock} szt.`)
      continue
    }
    if (priced.some((line) => line.slug === product.slug)) {
      errors.push(`${product.name} jest w zamówieniu więcej niż raz.`)
      continue
    }
    priced.push({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      qty,
      pricePerDay: product.pricePerDay,
      days: days ?? 1,
      lineTotal: product.pricePerDay * qty * (days ?? 1),
    })
  }

  const totalPln = priced.reduce((sum, line) => sum + line.lineTotal, 0)
  if (priced.length > 0 && totalPln <= 0) errors.push("Kwota zamówienia jest nieprawidłowa.")

  return {
    errors,
    order: {
      customer: {
        name,
        email,
        phone: phoneDigits.length === 9 ? phoneDigits : phoneDigits.slice(-9),
        phoneRaw,
      },
      event: {
        type,
        dateFrom,
        dateTo,
        timeFrom,
        timeTo,
        days: days ?? 1,
        street,
        postalCode,
        city,
        notes,
        guests,
      },
      items: priced,
      totalPln,
      amountGrosze: totalPln * 100,
    },
  }
}
