import type { Metadata } from "next"
import Link from "next/link"
import { PageIntro } from "@/components/page-intro"
import { company } from "@/lib/company"

export const metadata: Metadata = {
  title: "O firmie",
  description: "Kim jesteśmy i jak wygląda wynajem dmuchańca na imprezę.",
}

const steps = [
  ["01", "Wybierasz", "Dodajesz do koszyka jedną albo kilka atrakcji. Przy każdym modelu widać, ile sztuk jest w ofercie."],
  ["02", "Opisujesz imprezę", "Podajesz imię, e-mail, telefon, adres dostawy, daty, godziny i rodzaj imprezy."],
  ["03", "Płacisz", "Przechodzisz do Przelewy24. Po wpłacie dostajemy maila ze wszystkim, co wpisałeś."],
]

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <PageIntro
            eyebrow="O firmie"
            title="Dmuchańce dowozimy na Twoją imprezę."
            text="Wypożyczamy siedem dmuchanych atrakcji: zamki i zjeżdżalnie. Zamówienie składasz na stronie, a my dostajemy komplet informacji: co, gdzie, na kiedy i jak się z Tobą skontaktować."
          />
          <p className="mt-4 max-w-2xl leading-relaxed text-[#4e6b5a]">
            Każdy dmuchaniec jest z komercyjnego PVC, z dmuchawą, torbą i zestawem naprawczym. Na miejscu potrzebny jest dostęp do prądu. Po imprezie atrakcję odbieramy.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#4e6b5a]">
            Zamówienia obsługuje {company.legalName}, NIP {company.nip}. Pytania pisz na{" "}
            <a className="font-extrabold text-[#1c7c3a]" href={`mailto:${company.email}`}>
              {company.email}
            </a>
            {company.phone ? ` albo dzwoń: ${company.phone}` : ""}.
          </p>
          <Link href="/dmuchance" className="mt-8 inline-flex rounded-full bg-[#ffe14d] px-6 py-3 font-extrabold text-[#163024] shadow-[3px_3px_0_#163024]">
            Przejdź do dmuchańców
          </Link>
        </div>
        <img src="/produkty/statek-piratow.jpg" alt="Dmuchany statek piratów" className="h-80 w-full rounded-[2rem] object-cover shadow-[8px_8px_0_#ffe14d] lg:h-full" />
      </div>
      <div className="mt-14 rounded-[2rem] bg-[#f3fbe6] p-6 sm:p-10">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Jak wygląda rezerwacja</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map(([number, title, text]) => (
            <div key={number}>
              <span className="font-[family-name:var(--font-display)] text-4xl text-[#1c7c3a]">{number}</span>
              <h3 className="mt-2 text-xl font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4e6b5a]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
