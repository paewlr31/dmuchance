export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#1c7c3a]">{eyebrow}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#163024] sm:text-5xl">{title}</h1>
      {text ? <p className="mt-4 text-lg leading-relaxed text-[#4e6b5a]">{text}</p> : null}
    </div>
  )
}
