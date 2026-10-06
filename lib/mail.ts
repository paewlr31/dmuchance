import { Resend } from "resend"
import { formatPln } from "@/lib/products"
import type { StoredOrder } from "@/lib/orders"

function resendClient() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) return null
  return { client: new Resend(apiKey), from }
}

export function orderMessage(order: StoredOrder) {
  const lines = [
    "Wpłynęło opłacone zamówienie.",
    "",
    `Numer zamówienia: ${order.sessionId}`,
    order.p24OrderId ? `Numer płatności Przelewy24: ${order.p24OrderId}` : "",
    `Kwota: ${formatPln(order.totalPln)}`,
    "",
    "Kontakt do klienta:",
    `Imię i nazwisko: ${order.customer.name}`,
    `E-mail: ${order.customer.email}`,
    `Telefon: ${order.customer.phoneRaw}`,
    "",
    "Impreza:",
    `Rodzaj: ${order.event.type}`,
    `Od: ${order.event.dateFrom}, dostawa o ${order.event.timeFrom}`,
    `Do: ${order.event.dateTo}, odbiór o ${order.event.timeTo}`,
    `Liczba dni: ${order.event.days}`,
    `Miejsce: ${order.event.street}, ${order.event.postalCode} ${order.event.city}`,
    order.event.guests ? `Liczba dzieci: ${order.event.guests}` : "",
    order.event.notes ? `Uwagi: ${order.event.notes}` : "",
    "",
    "Co zamówiono:",
    ...order.items.map(
      (item) =>
        `- ${item.name} (${item.sku}), ${item.qty} szt. × ${item.days} ${item.days === 1 ? "dzień" : "dni"} = ${formatPln(item.lineTotal)}`,
    ),
    "",
    `Razem: ${formatPln(order.totalPln)}`,
  ]
  return lines.filter((line) => line !== "").join("\n")
}

export async function sendOrderEmail(order: StoredOrder) {
  const mail = resendClient()
  const to = process.env.ORDER_NOTIFY_EMAIL
  if (!mail || !to) {
    throw new Error("Brak RESEND_API_KEY, RESEND_FROM albo ORDER_NOTIFY_EMAIL.")
  }

  const { error } = await mail.client.emails.send({
    from: mail.from,
    to,
    replyTo: order.customer.email,
    subject: `Zamówienie ${order.customer.name}, ${order.event.dateFrom}, ${formatPln(order.totalPln)}`,
    text: orderMessage(order),
  })

  if (error) throw new Error(error.message)
}

export async function sendContactEmail(input: { name: string; email: string; phone: string; message: string }) {
  const mail = resendClient()
  const to = process.env.CONTACT_TO_EMAIL || process.env.ORDER_NOTIFY_EMAIL
  if (!mail || !to) {
    throw new Error("Formularz nie jest jeszcze podłączony. Uzupełnij klucze Resend.")
  }

  const { error } = await mail.client.emails.send({
    from: mail.from,
    to,
    replyTo: input.email,
    subject: `Wiadomość ze strony od ${input.name}`,
    text: [`Imię i nazwisko: ${input.name}`, `E-mail: ${input.email}`, input.phone ? `Telefon: ${input.phone}` : "", "", input.message]
      .filter((line) => line !== "")
      .join("\n"),
  })

  if (error) throw new Error(error.message)
}
