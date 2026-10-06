import type { Metadata } from "next"
import { CheckoutForm, CheckoutIntro } from "@/components/checkout-form"

export const metadata: Metadata = {
  title: "Zamówienie",
  description: "Dane imprezy i płatność za wynajem dmuchańców.",
}

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <CheckoutIntro />
      <CheckoutForm />
    </section>
  )
}
