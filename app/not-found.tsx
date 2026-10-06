import Link from "next/link"

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[#163024]">Nie ma takiej strony</h1>
      <Link href="/dmuchance" className="mt-6 inline-flex font-extrabold text-[#1c7c3a]">
        Wróć do dmuchańców
      </Link>
    </section>
  )
}
