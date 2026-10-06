import type { Metadata } from "next"
import { PaymentReturn } from "@/components/payment-return"

export const metadata: Metadata = {
  title: "Potwierdzenie płatności",
}

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ sid?: string }> }) {
  const { sid } = await searchParams
  return <PaymentReturn sessionId={sid ?? ""} />
}
