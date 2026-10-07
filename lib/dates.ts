export function formatPolishDate(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date(`${iso}T12:00:00`))
}

export function formatRange(from: string, to: string) {
  if (from === to) return formatPolishDate(from)
  return `${formatPolishDate(from)} – ${formatPolishDate(to)}`
}
