import { createHash, timingSafeEqual } from "crypto"

type SignValue = string | number

export function p24Config() {
  const merchantId = Number(process.env.P24_MERCHANT_ID)
  const posId = Number(process.env.P24_POS_ID || process.env.P24_MERCHANT_ID)
  const apiKey = process.env.P24_API_KEY ?? ""
  const crc = process.env.P24_CRC ?? ""
  const sandbox = process.env.P24_SANDBOX !== "false"
  const missing = [
    !Number.isInteger(merchantId) || merchantId <= 0 ? "P24_MERCHANT_ID" : "",
    !Number.isInteger(posId) || posId <= 0 ? "P24_POS_ID" : "",
    !apiKey ? "P24_API_KEY" : "",
    !crc ? "P24_CRC" : "",
  ].filter(Boolean)

  return {
    merchantId,
    posId,
    apiKey,
    crc,
    sandbox,
    missing,
    apiBase: sandbox ? "https://sandbox.przelewy24.pl/api/v1" : "https://secure.przelewy24.pl/api/v1",
    redirectBase: sandbox ? "https://sandbox.przelewy24.pl/trnRequest" : "https://secure.przelewy24.pl/trnRequest",
  }
}

export function p24Sign(fields: Record<string, SignValue>) {
  return createHash("sha384").update(JSON.stringify(fields), "utf8").digest("hex")
}

export function signaturesMatch(received: string, expected: string) {
  const left = Buffer.from(received)
  const right = Buffer.from(expected)
  if (left.length !== right.length || left.length === 0) return false
  return timingSafeEqual(left, right)
}

export function requestOrigin(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "")
  if (configured) return configured
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

type RegisterInput = {
  sessionId: string
  amount: number
  description: string
  email: string
  client: string
  address: string
  zip: string
  city: string
  phone: string
  urlReturn: string
  urlStatus: string
}

export async function registerTransaction(input: RegisterInput) {
  const config = p24Config()
  if (config.missing.length > 0) {
    throw new Error(`Brak danych Przelewy24: ${config.missing.join(", ")}.`)
  }

  const sign = p24Sign({
    sessionId: input.sessionId,
    merchantId: config.merchantId,
    amount: input.amount,
    currency: "PLN",
    crc: config.crc,
  })

  const response = await fetch(`${config.apiBase}/transaction/register`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.posId}:${config.apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantId: config.merchantId,
      posId: config.posId,
      sessionId: input.sessionId,
      amount: input.amount,
      currency: "PLN",
      description: input.description.slice(0, 1024),
      email: input.email,
      client: input.client,
      address: input.address,
      zip: input.zip,
      city: input.city,
      country: "PL",
      phone: input.phone.slice(0, 12),
      language: "pl",
      urlReturn: input.urlReturn,
      urlStatus: input.urlStatus,
      timeLimit: 30,
      waitForResult: true,
      regulationAccept: true,
      encoding: "UTF-8",
      sign,
    }),
  })

  const payload = (await response.json().catch(() => null)) as { data?: { token?: string }; error?: string } | null
  if (!response.ok || !payload?.data?.token) {
    throw new Error(payload?.error || "Przelewy24 nie przyjął zamówienia. Sprawdź dane sandbox.")
  }

  return `${config.redirectBase}/${payload.data.token}`
}

export async function verifyTransaction(input: { sessionId: string; amount: number; orderId: number }) {
  const config = p24Config()
  const sign = p24Sign({
    sessionId: input.sessionId,
    orderId: input.orderId,
    amount: input.amount,
    currency: "PLN",
    crc: config.crc,
  })

  const response = await fetch(`${config.apiBase}/transaction/verify`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.posId}:${config.apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantId: config.merchantId,
      posId: config.posId,
      sessionId: input.sessionId,
      amount: input.amount,
      currency: "PLN",
      orderId: input.orderId,
      sign,
    }),
  })

  const payload = (await response.json().catch(() => null)) as { responseCode?: number; data?: { status?: string } } | null
  return response.ok && payload?.responseCode === 0 && payload.data?.status === "success"
}
