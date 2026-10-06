import { randomBytes } from "crypto"
import { mkdir, readFile, readdir, writeFile } from "fs/promises"
import path from "path"
import { rangesOverlap } from "@/lib/booking"
import type { PricedItem } from "@/lib/booking"
import { getProduct } from "@/lib/products"

export type StoredOrder = {
  sessionId: string
  createdAt: string
  status: "pending" | "paid" | "received"
  emailSent: boolean
  p24OrderId?: number
  customer: {
    name: string
    email: string
    phone: string
    phoneRaw: string
  }
  event: {
    type: string
    dateFrom: string
    dateTo: string
    timeFrom: string
    timeTo: string
    days: number
    street: string
    postalCode: string
    city: string
    notes: string
    guests: string
  }
  items: PricedItem[]
  totalPln: number
  amountGrosze: number
}

const ordersDir = path.join(process.cwd(), ".data", "orders")

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function ordersCanBeSaved() {
  return useBlob() || !process.env.VERCEL
}

function assertStorage() {
  if (!useBlob() && process.env.VERCEL) {
    throw new Error("Na Vercelu dodaj magazyn Blob. Bez niego serwer nie zapamięta zamówienia do czasu potwierdzenia płatności.")
  }
}

async function saveBlob(order: StoredOrder) {
  const { put } = await import("@vercel/blob")
  await put(`orders/${order.sessionId}.json`, JSON.stringify(order), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

async function readBlob(sessionId: string) {
  const { get } = await import("@vercel/blob")
  try {
    const result = await get(`orders/${sessionId}.json`, {
      access: "private",
      useCache: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    if (!result || result.statusCode !== 200) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as StoredOrder
  } catch {
    return null
  }
}

async function listBlob() {
  const { list } = await import("@vercel/blob")
  const found = await list({
    prefix: "orders/",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  const orders: StoredOrder[] = []
  for (const blob of found.blobs) {
    const sessionId = blob.pathname.replace(/^orders\//, "").replace(/\.json$/, "")
    const order = await readBlob(sessionId)
    if (order) orders.push(order)
  }
  return orders
}

export async function saveOrder(order: StoredOrder) {
  assertStorage()
  if (useBlob()) {
    await saveBlob(order)
    return
  }
  await mkdir(ordersDir, { recursive: true })
  await writeFile(path.join(ordersDir, `${order.sessionId}.json`), JSON.stringify(order), "utf8")
}

export async function readOrder(sessionId: string) {
  if (!/^dm-[a-f0-9]{16}$/.test(sessionId)) return null
  if (useBlob()) return readBlob(sessionId)
  try {
    const raw = await readFile(path.join(ordersDir, `${sessionId}.json`), "utf8")
    return JSON.parse(raw) as StoredOrder
  } catch {
    return null
  }
}

export async function listOrders() {
  if (useBlob()) return listBlob()
  try {
    const files = await readdir(ordersDir)
    const orders: StoredOrder[] = []
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const raw = await readFile(path.join(ordersDir, file), "utf8")
      orders.push(JSON.parse(raw) as StoredOrder)
    }
    return orders
  } catch {
    return []
  }
}

export function newSessionId() {
  return `dm-${randomBytes(8).toString("hex")}`
}

export async function availabilityProblems(items: PricedItem[], dateFrom: string, dateTo: string) {
  const orders = await listOrders()
  const now = Date.now()
  const problems: string[] = []

  for (const item of items) {
    const product = getProduct(item.slug)
    if (!product) continue
    let used = 0
    for (const order of orders) {
      const age = now - Date.parse(order.createdAt)
      const blocks = order.status === "paid" || order.status === "received" || (order.status === "pending" && age < 45 * 60 * 1000)
      if (!blocks) continue
      if (!rangesOverlap(dateFrom, dateTo, order.event.dateFrom, order.event.dateTo)) continue
      used += order.items.find((line) => line.slug === item.slug)?.qty ?? 0
    }
    if (used + item.qty > product.stock) {
      problems.push(`${product.name}: na te dni zostało ${Math.max(0, product.stock - used)} szt.`)
    }
  }

  return problems
}
