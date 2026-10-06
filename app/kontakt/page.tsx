import type { Metadata } from "next"
import { Mail, Phone } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { PageIntro } from "@/components/page-intro"
import { company } from "@/lib/company"

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Napisz w sprawie wynajmu dmuchańca.",
}

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
      <div>
        <PageIntro eyebrow="Kontakt" title="Napisz albo zadzwoń." text="Jeśli wolisz zapytać przed zamówieniem, zostaw wiadomość. Formularz trafia na naszą skrzynkę." />
        <div className="mt-8 grid gap-4">
          <a href={`mailto:${company.email}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-extrabold">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#ffe14d]">
              <Mail size={18} />
            </span>
            {company.email}
          </a>
          {company.phone ? (
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-extrabold">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#d8f56a]">
                <Phone size={18} />
              </span>
              {company.phone}
            </a>
          ) : null}
        </div>
      </div>
      <ContactForm />
    </section>
  )
}
