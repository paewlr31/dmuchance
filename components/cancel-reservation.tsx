"use client"

import { useState } from "react"

export function CancelReservation({ token, cancelled }: { token: string; cancelled: boolean }) {
  const [status, setStatus] = useState(cancelled ? "cancelled" : "ready")
  const [error, setError] = useState("")

  async function cancel() {
    setStatus("sending")
    setError("")
    const response = await fetch("/api/rezerwacje/anuluj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setStatus("ready")
      setError(payload?.error || "Nie udało się anulować.")
      return
    }
    setStatus("cancelled")
  }

  if (status === "cancelled") {
    return <p className="mt-6 rounded-2xl bg-[#f3fbe6] px-4 py-3 font-extrabold">Rezerwacja jest anulowana. Termin jest znowu wolny.</p>
  }

  return (
    <div className="mt-6">
      {error ? <p className="mb-3 rounded-2xl bg-[#fff1cc] px-4 py-3 text-sm font-bold">{error}</p> : null}
      <button type="button" onClick={cancel} disabled={status === "sending"} className="rounded-full bg-[#1c7c3a] px-5 py-3 font-extrabold text-white disabled:opacity-60">
        {status === "sending" ? "Anuluję..." : "Anuluj rezerwację"}
      </button>
    </div>
  )
}
