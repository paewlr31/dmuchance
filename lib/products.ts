/**
 * Dane z wyceny New Leap (NL20260923).
 * Cena jednostkowa z PDF jest w dolarach. Na stronie ta sama liczba jest
 * ceną wynajmu za jeden dzień w złotych, bo płatność idzie w PLN.
 * Przed prawdziwymi wpłatami popraw `pricePerDay` w tym pliku.
 */

export type Product = {
  slug: string
  sku: string
  name: string
  category: string
  pricePerDay: number
  /** Długość × szerokość × wysokość rozłożonego dmuchańca, w metrach. */
  size: [number, number, number]
  /** Ile sztuk jest w ofercie. */
  stock: number
  weightKg: number
  /** Długość × szerokość × wysokość paczki, w metrach. */
  packageSize: [number, number, number]
  image: string
  summary: string
  description: string
}

export const sharedFacts = [
  "Konstrukcja dmuchana, szyta ze wzmocnieniami.",
  "Materiał: komercyjne PVC 0,55 mm, wytrzymałe i trudnopalne.",
  "W zestawie jest dmuchawa z oznaczeniem CE, torba i zestaw naprawczy.",
  "Dmuchawa potrzebuje zwykłego dostępu do prądu na miejscu imprezy.",
]

export const products: Product[] = [
  {
    slug: "zamek-wrozek",
    sku: "XYXT07",
    name: "Zamek wróżek",
    category: "Zamek",
    pricePerDay: 1008,
    size: [5, 5, 4],
    stock: 2,
    weightKg: 140,
    packageSize: [0.9, 0.75, 0.75],
    image: "/produkty/zamek-wrozek.jpg",
    summary: "Kolorowy zamek z wieżyczkami i zjeżdżalnią, z motywem wróżek.",
    description:
      "Zamek z czterema wieżyczkami, frontowym wejściem i zjeżdżalnią z boku. Ściany są w kolorach fioletu, żółci i czerwieni, z chmurami, gwiazdami i wróżkami. W środku jest komora do skakania. Dobrze wygląda na urodzinach w ogrodzie.",
  },
  {
    slug: "kolorowy-plac",
    sku: "XYXT44",
    name: "Kolorowy plac zabaw",
    category: "Plac zabaw",
    pricePerDay: 1191,
    size: [6, 5, 4.5],
    stock: 1,
    weightKg: 160,
    packageSize: [1.1, 0.8, 0.8],
    image: "/produkty/kolorowy-plac.jpg",
    summary: "Największy zamek: siatka, słupki w środku i szeroka zjeżdżalnia.",
    description:
      "Duża konstrukcja z otwartą siatką, kolorowymi słupkami w środku i szeroką zjeżdżalnią zakończoną poduchą. Dzieci skaczą w komorze i zjeżdżają obok. To najwyższy i najcięższy zamek w ofercie.",
  },
  {
    slug: "lodowy-zamek",
    sku: "XYXT96",
    name: "Lodowy zamek",
    category: "Zamek",
    pricePerDay: 1008,
    size: [5, 5, 4],
    stock: 2,
    weightKg: 140,
    packageSize: [0.9, 0.75, 0.75],
    image: "/produkty/lodowy-zamek.jpg",
    summary: "Niebieski zamek w zimowym, bajkowym klimacie, z osobną wieżą.",
    description:
      "Niebieski zamek z komorą do skakania i osobną wieżą ze schodkami. Całość utrzymana jest w zimowym, bajkowym klimacie. Obok komory jest drugie stanowisko do wspinania i zjeżdżania.",
  },
  {
    slug: "ogrodowa-zjezdzalnia",
    sku: "XYXT116",
    name: "Ogrodowa zjeżdżalnia",
    category: "Zjeżdżalnia",
    pricePerDay: 1206,
    size: [6, 5, 3.5],
    stock: 2,
    weightKg: 155,
    packageSize: [1.1, 0.8, 0.8],
    image: "/produkty/ogrodowa-zjezdzalnia.jpg",
    summary: "Niska zjeżdżalnia z kwiatami, motylem i szerokim lądowiskiem.",
    description:
      "Kolorowa, niższa atrakcja z kwiatami, motylem i pszczołą. Zjeżdżalnia prowadzi na szerokie zielone lądowisko, a obok jest mała platforma. Wysokość 3,5 m sprawia, że dobrze pasuje do zabawy młodszych dzieci pod opieką dorosłych.",
  },
  {
    slug: "statek-piratow",
    sku: "XYXT126",
    name: "Statek piratów",
    category: "Zamek",
    pricePerDay: 1023,
    size: [5, 5, 4],
    stock: 1,
    weightKg: 140,
    packageSize: [0.9, 0.75, 0.75],
    image: "/produkty/statek-piratow.jpg",
    summary: "Piracki domek z palmami, skarbem i zjeżdżalnią.",
    description:
      "Dmuchany domek w stylu pirackiego statku: deski, palmy, beczka i skrzynia ze skarbem. Z przodu jest wejście do środka, a z boku zjeżdżalnia. Dobry wybór, gdy impreza ma mieć wyraźny motyw.",
  },
  {
    slug: "zjezdzalnia-z-tunelami",
    sku: "SL07",
    name: "Zjeżdżalnia z tunelami",
    category: "Zjeżdżalnia",
    pricePerDay: 763,
    size: [6, 3, 5],
    stock: 1,
    weightKg: 110,
    packageSize: [0.9, 0.7, 0.7],
    image: "/produkty/zjezdzalnia-z-tunelami.jpg",
    summary: "Wysoka zjeżdżalnia z jednym torem, tunelem i ścianką do wspinania.",
    description:
      "Wysoka zjeżdżalnia o jednym torze. U góry jest tunel z siatką, a z przodu ścianka, po której wchodzi się na górę. Lądowisko jest szerokie i niskie. Zajmuje mniej miejsca na szerokość niż zamki.",
  },
  {
    slug: "podwojna-zjezdzalnia",
    sku: "SL09",
    name: "Podwójna zjeżdżalnia",
    category: "Zjeżdżalnia",
    pricePerDay: 992,
    size: [8, 3, 6],
    stock: 1,
    weightKg: 130,
    packageSize: [0.9, 0.75, 0.75],
    image: "/produkty/podwojna-zjezdzalnia.jpg",
    summary: "Dwa tory obok siebie: jeden ze stopniami, drugi gładki.",
    description:
      "Najdłuższa atrakcja w ofercie. Dwa tory biegną obok siebie: jeden ma kolorowe stopnie do wspinaczki, drugi jest gładkim zjazdem. Na górze są tunele z siatką, na dole wspólne lądowisko. Dzieci mogą ścigać się parami.",
  },
]

export const eventTypes = [
  "Urodziny",
  "Przyjęcie rodzinne",
  "Impreza firmowa",
  "Festyn lub piknik",
  "Inne",
] as const

export type EventType = (typeof eventTypes)[number]

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}

export function formatMeters(size: [number, number, number]) {
  const format = (value: number) => value.toLocaleString("pl-PL", { maximumFractionDigits: 2 })
  return `${format(size[0])} × ${format(size[1])} × ${format(size[2])} m`
}

export function formatPln(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value)
}
