import { createHmac } from "crypto"
import { cookies } from "next/headers"

const cookieName = "rezerwacje"

export function reservationPassword() {
  return process.env.REZERWACJE_HASLO ?? ""
}

function seal() {
  return createHmac("sha256", reservationPassword()).update("rezerwacje-ok").digest("hex")
}

export async function isReservationAdmin() {
  if (!reservationPassword()) return false
  const jar = await cookies()
  return jar.get(cookieName)?.value === seal()
}

export async function grantReservationAdmin() {
  const jar = await cookies()
  jar.set(cookieName, seal(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 })
}

export async function clearReservationAdmin() {
  const jar = await cookies()
  jar.set(cookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 })
}
