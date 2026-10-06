import Link from "next/link"
import { company, navItems } from "@/lib/company"

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#145c32] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <strong className="font-[family-name:var(--font-display)] text-2xl">
            {company.brand} <span className="text-[#ffe14d]">{company.tagline}</span>
          </strong>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#d7f5c4]">
            Wynajem dmuchańców na urodziny i inne imprezy. Dowozimy atrakcję pod adres, który podasz w zamówieniu.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-extrabold text-[#ffe14d]">Menu</p>
          <div className="mt-3 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#ffe14d]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="font-extrabold text-[#ffe14d]">Kontakt</p>
          <p className="mt-3">
            <a className="hover:text-[#ffe14d]" href={`mailto:${company.email}`}>
              {company.email}
            </a>
          </p>
          {company.phone ? <p className="mt-1">{company.phone}</p> : null}
          <p className="mt-4 text-[#d7f5c4]">
            {company.legalName}
            <br />
            NIP {company.nip}
          </p>
        </div>
      </div>
    </footer>
  )
}
