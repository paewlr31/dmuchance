"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { company, navItems } from "@/lib/company"

export function SiteHeader() {
  const pathname = usePathname()
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#eadc9a] bg-[#fffdf8]">
      <div className="bg-[#1c7c3a] px-4 py-2 text-center text-xs font-extrabold tracking-wide text-[#ffe14d] sm:text-sm">
        Siedem dmuchańców na imprezy · dowóz pod wskazany adres
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="" className="size-12 shrink-0 rounded-2xl bg-white object-contain sm:size-14" />
          <span className="min-w-0">
            <strong className="block truncate font-[family-name:var(--font-display)] text-xl leading-none text-[#163024] sm:text-2xl">
              {company.brand}
            </strong>
            <small className="font-extrabold text-[#1c7c3a]">{company.tagline}</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-extrabold text-[#163024] xl:flex" aria-label="Główne menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "text-[#145c32] underline decoration-[#ffe14d] decoration-4 underline-offset-8" : "hover:text-[#1c7c3a]"}
            >
              {item.label}
              {item.href === "/koszyk" && count > 0 ? ` (${count})` : ""}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="relative rounded-full border-2 border-[#d7ecc4] bg-white p-3 xl:hidden"
          aria-expanded={open}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#ffe14d] px-1 text-[11px] font-extrabold text-[#163024]">
              {count}
            </span>
          ) : null}
        </button>
      </div>
      {open && (
        <nav className="border-t border-[#d7ecc4] bg-white px-4 py-4 xl:hidden" aria-label="Menu mobilne">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-3 py-3 text-base font-extrabold ${pathname === item.href ? "bg-[#ffe14d]" : "hover:bg-[#f3fbe6]"}`}
              >
                {item.label}
                {item.href === "/koszyk" && count > 0 ? ` (${count})` : ""}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
