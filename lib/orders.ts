import { randomBytes } from "crypto"
import { mkdir, readFile, readdir, writeFile } from "fs/promises"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { rangesOverlap, warsawToday } from "@/lib/booking"
import type { PricedItem } from "@/lib/booking"
import { getProduct, products } from "@/lib/products"

export type StoredOrder = {
  sessionId: string
  cancelToken: string
  createdAt: string
  status: "pending" | "paid" | "received" | "cancelled"
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
  cancelUrl?: string
}

const ordersDir = path.join(process.cwd(), ".data", "orders")

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function supabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function ordersCanBeSaved() {
  return Boolean(supabase()) || useBlob() || !process.env.VERCEL
}

export function newCancelToken() {
  return randomBytes(16).toString("hex")
}

export function reservationBlocks(order: StoredOrder, now = Date.now()) {
  if (order.status === "cancelled") return false
  if (order.status === "pending") return now - Date.parse(order.createdAt) < 45 * 60 * 1000
  return order.status === "paid" || order.status === "received"
}

export type BookedSlot = {
  from: string
  to: string
  qty: number
  stock: number
}

type ReservationRow = {
  session_id: string
  cancel_token: string
  status: StoredOrder["status"]
  created_at: string
  email_sent: boolean
  p24_order_id: number | null
  customer: StoredOrder["customer"]
  event: StoredOrder["event"]
  items: PricedItem[]
  total_pln: number
  amount_grosze: number
  date_from: string
  date_to: string
}

function fromRow(row: ReservationRow): StoredOrder {
  return {
    sessionId: row.session_id,
    cancelToken: row.cancel_token,
    createdAt: row.created_at,
    status: row.status,
    emailSent: row.email_sent,
    p24OrderId: row.p24_order_id ?? undefined,
    customer: row.customer,
    event: row.event,
    items: row.items,
    totalPln: row.total_pln,
    amountGrosze: row.amount_grosze,
  }
}

function toRow(order: StoredOrder): ReservationRow {
  return {
    session_id: order.sessionId,
    cancel_token: order.cancelToken,
    status: order.status,
    created_at: order.createdAt,
    email_sent: order.emailSent,
    p24_order_id: order.p24OrderId ?? null,
    customer: order.customer,
    event: order.event,
    items: order.items,
    total_pln: order.totalPln,
    amount_grosze: order.amountGrosze,
    date_from: order.event.dateFrom,
    date_to: order.event.dateTo,
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
  const db = supabase()
  if (db) {
    const { error } = await db.from("reservations").upsert(toRow(order), { onConflict: "session_id" })
    if (error) throw new Error(error.message)
    return
  }
  if (useBlob()) {
    await saveBlob(order)
    return
  }
  if (process.env.VERCEL) return
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

async function listFromDisk() {
  try {
    const files = await readdir(ordersDir)
    const orders: StoredOrder[] = []
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const raw = await readFile(path.join(ordersDir, file), "utf8")
      const order = JSON.parse(raw) as StoredOrder
      if (!order.cancelToken) order.cancelToken = ""
      orders.push(order)
    }
    return orders
  } catch {
    return []
  }
}

export async function listOrders() {
  const db = supabase()
  if (db) {
    const { data, error } = await db.from("reservations").select("*").order("created_at", { ascending: false }).limit(300)
    if (error) throw new Error(error.message)
    return ((data ?? []) as ReservationRow[]).map(fromRow)
  }
  if (useBlob()) return listBlob()
  if (process.env.VERCEL) return []
  return listFromDisk()
}

export async function findByCancelToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null
  const db = supabase()
  if (db) {
    const { data, error } = await db.from("reservations").select("*").eq("cancel_token", token).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? fromRow(data as ReservationRow) : null
  }
  const orders = await listOrders()
  return orders.find((order) => order.cancelToken === token) ?? null
}

export async function cancelByToken(token: string) {
  const order = await findByCancelToken(token)
  if (!order) return null
  if (order.status === "cancelled") return order
  order.status = "cancelled"
  await saveOrder(order)
  return order
}

export async function bookingsBySlug() {
  const today = warsawToday()
  const map: Record<string, BookedSlot[]> = {}
  for (const product of products) map[product.slug] = []
  for (const order of await listOrders()) {
    if (!reservationBlocks(order)) continue
    if (order.event.dateTo < today) continue
    for (const line of order.items) {
      const product = getProduct(line.slug)
      if (!product) continue
      map[line.slug].push({ from: order.event.dateFrom, to: order.event.dateTo, qty: line.qty, stock: product.stock })
    }
  }
  for (const slug of Object.keys(map)) map[slug].sort((left, right) => left.from.localeCompare(right.from))
  return map
}

export async function bookingsForProduct(slug: string) {
  const product = getProduct(slug)
  if (!product) return []
  const today = warsawToday()
  const slots: BookedSlot[] = []
  for (const order of await listOrders()) {
    if (!reservationBlocks(order)) continue
    if (order.event.dateTo < today) continue
    const line = order.items.find((item) => item.slug === slug)
    if (!line) continue
    slots.push({ from: order.event.dateFrom, to: order.event.dateTo, qty: line.qty, stock: product.stock })
  }
  return slots.sort((left, right) => left.from.localeCompare(right.from))
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
      if (!reservationBlocks(order, now)) continue
      if (!rangesOverlap(dateFrom, dateTo, order.event.dateFrom, order.event.dateTo)) continue
      used += order.items.find((line) => line.slug === item.slug)?.qty ?? 0
    }
    if (used + item.qty > product.stock) {
      const left = Math.max(0, product.stock - used)
      problems.push(left === 0 ? `${product.name} jest w tych dniach zajęty.` : `${product.name}: na te dni zostało ${left} szt.`)
    }
  }

  return problems
}
