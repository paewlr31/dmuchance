import type { Metadata } from "next"
import { PageIntro } from "@/components/page-intro"

export const metadata: Metadata = {
  title: "Zamówienia i zwroty",
  description: "Zasady składania zamówienia, zmiany terminu i zwrotu wpłaty.",
}

const items = [
  ["Jak składa się zamówienie?", "Wybierasz dmuchańce, podajesz imię i nazwisko, e-mail, telefon, adres dostawy, daty, godziny oraz rodzaj imprezy. Potem płacisz przez Przelewy24. Po zaksięgowaniu wpłaty dostajemy maila z tymi danymi."],
  ["Cena", "Cena przy dmuchańcu jest za jeden dzień i jedną sztukę. Jeśli wynajem trwa kilka dni albo bierzesz więcej sztuk, kwota mnoży się. Dostawa pod wskazany adres jest w tej kwocie."],
  ["Zmiana terminu", "Napisz na adres z zakładki Kontakt. Termin da się przenieść, jeśli atrakcja jest wolna w nowym dniu. Im wcześniej napiszesz, tym łatwiej znaleźć inny dzień."],
  ["Rezygnacja", "Do 7 dni przed rozpoczęciem wynajmu zwracamy pełną wpłatę. Później zwracamy połowę. W dniu imprezy wpłata nie podlega zwrotowi, chyba że nie możemy dojechać z naszej winy."],
  ["Pogoda", "Jeśli z powodu burzy albo silnego wiatru nie da się bezpiecznie rozłożyć dmuchańca, przenosimy termin albo zwracamy wpłatę."],
  ["Płatność", "Płatność obsługuje Przelewy24. Nie zapisujemy numeru karty ani danych logowania do banku. Na stronie widać tylko podsumowanie zamówienia."],
]

export default function ReturnsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro eyebrow="Informacje" title="Zamówienia i zwroty" text="Tak obsługujemy rezerwacje. Jeśli potrzebujesz innego ustalenia, napisz przed płatnością." />
      <div className="mt-8 grid gap-3">
        {items.map(([title, text]) => (
          <details key={title} className="group rounded-2xl border border-[#d7ecc4] bg-white p-5">
            <summary className="cursor-pointer list-none pr-6 font-extrabold marker:content-none">{title}</summary>
            <p className="mt-3 leading-relaxed text-[#4e6b5a]">{text}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
