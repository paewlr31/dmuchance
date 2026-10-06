import type { Metadata } from "next"
import { PageIntro } from "@/components/page-intro"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export const metadata: Metadata = {
  title: "Dmuchańce",
  description: "Siedem dmuchanych zamków i zjeżdżalni do wynajęcia na imprezę.",
}

export default function CatalogPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro
        eyebrow="Dmuchańce"
        title="Wybierz atrakcję"
        text="Kliknij dmuchańca, żeby zobaczyć zdjęcie, wymiary, wagę, paczkę i opis. Cenę liczymy za każdy dzień wynajmu. Możesz dodać kilka modeli do jednego zamówienia."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
