import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { clearReservationAdmin, grantReservationAdmin, isReservationAdmin, reservationPassword } from "@/lib/admin-session"
import { formatRange } from "@/lib/dates"
import { cancelByToken, listOrders } from "@/lib/orders"
import { formatPln } from "@/lib/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Rezerwacje",
}

async function login(formData: FormData) {
  "use server"
  if (!reservationPassword() || formData.get("haslo") !== reservationPassword()) return
  await grantReservationAdmin()
  redirect("/rezerwacje")
}

async function logout() {
  "use server"
  await clearReservationAdmin()
  redirect("/rezerwacje")
}

async function cancel(formData: FormData) {
  "use server"
  if (!(await isReservationAdmin())) redirect("/rezerwacje")
  await cancelByToken(String(formData.get("token") ?? ""))
  redirect("/rezerwacje")
}

export default async function ReservationsPage() {
  const passwordReady = Boolean(reservationPassword())
  const allowed = await isReservationAdmin()
  const orders = allowed ? await listOrders() : []

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#1c7c3a]">Obsługa</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[#163024]">Rezerwacje</h1>
        {allowed ? (
          <form action={logout}>
            <button className="rounded-full border-2 border-[#163024] px-4 py-2 text-sm font-extrabold">Wyloguj</button>
          </form>
        ) : null}
      </div>
      {!passwordReady ? <p className="mt-4 text-[#4e6b5a]">Ustaw hasło REZERWACJE_HASLO w zmiennych środowiska, żeby otworzyć listę.</p> : null}
      {passwordReady && !allowed ? (
        <form action={login} className="mt-6 grid max-w-sm gap-3">
          <input name="haslo" type="password" placeholder="Hasło" className="rounded-2xl border-2 border-[#d7ecc4] bg-white px-4 py-3" />
          <button className="rounded-full bg-[#1c7c3a] px-5 py-3 font-extrabold text-white">Wejdź</button>
        </form>
      ) : null}
      {allowed ? (
        <div className="mt-8 grid gap-3">
          {orders.length === 0 ? <p className="text-[#4e6b5a]">Nie ma jeszcze rezerwacji.</p> : null}
          {orders.map((order) => (
            <article key={order.sessionId} className="rounded-2xl bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-extrabold">{order.customer.name}</h2>
                <p className="text-sm font-extrabold text-[#1c7c3a]">{order.status === "cancelled" ? "anulowana" : "aktywna"}</p>
              </div>
              <dl className="mt-3 grid gap-1 text-sm text-[#163024]">
                <div>
                  <dt className="inline font-extrabold">E-mail: </dt>
                  <dd className="inline">
                    <a className="text-[#1c7c3a]" href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className="inline font-extrabold">Telefon: </dt>
                  <dd className="inline">{order.customer.phoneRaw || order.customer.phone}</dd>
                </div>
                <div>
                  <dt className="inline font-extrabold">Impreza: </dt>
                  <dd className="inline">{order.event.type}{order.event.guests ? `, dzieci: ${order.event.guests}` : ""}</dd>
                </div>
                <div>
                  <dt className="inline font-extrabold">Termin: </dt>
                  <dd className="inline">
                    {formatRange(order.event.dateFrom, order.event.dateTo)}, dostawa {order.event.timeFrom}, odbiór {order.event.timeTo}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-extrabold">Adres: </dt>
                  <dd className="inline">{order.event.street}, {order.event.postalCode} {order.event.city}</dd>
                </div>
                {order.event.notes ? (
                  <div>
                    <dt className="inline font-extrabold">Uwagi: </dt>
                    <dd className="inline">{order.event.notes}</dd>
                  </div>
                ) : null}
              </dl>
              <ul className="mt-3 grid gap-1 text-sm font-bold">
                {order.items.map((item) => (
                  <li key={item.slug}>{item.name} × {item.qty} · {formatPln(item.lineTotal)}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-extrabold">Razem: {formatPln(order.totalPln)}</p>
              {order.status !== "cancelled" && order.cancelToken ? (
                <form action={cancel} className="mt-3">
                  <input type="hidden" name="token" value={order.cancelToken} />
                  <button className="text-sm font-extrabold text-[#9a4d16]">Anuluj</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
