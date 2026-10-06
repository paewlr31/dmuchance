export const company = {
  brand: "Dmuchańce",
  tagline: "na imprezy",
  legalName: "GPR Trade Sp. z o.o.",
  nip: "7123517520",
  email: "grzegorzkrol@vp.pl",
  /**
   * Numer widoczny na stronie. Zostaw pusty, dopóki nie chcesz go pokazywać.
   * Przykład: "+48 500 600 700"
   */
  phone: "",
}

export const navItems = [
  { href: "/o-firmie", label: "O firmie" },
  { href: "/dmuchance", label: "Dmuchańce" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/koszyk", label: "Koszyk" },
  { href: "/zamowienia-i-zwroty", label: "Zamówienia i zwroty" },
] as const
