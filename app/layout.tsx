import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { CartProvider } from "@/components/cart-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: { default: "Dmuchańce na imprezy", template: "%s · Dmuchańce" },
  description: "Wynajem dmuchanych zamków i zjeżdżalni na imprezy.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fffdf6",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={nunito.variable}>
      <body className="min-h-screen bg-[#fffdf6] font-[family-name:var(--font-body)] text-[#163024] antialiased">
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
