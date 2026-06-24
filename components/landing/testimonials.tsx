import { Star } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "./reveal"

const testimonials = [
  {
    quote:
      "Dobramos as vendas no WhatsApp em 3 meses. O funil visual mudou completamente como o time trabalha.",
    name: "Mariana Lopes",
    role: "Head de Vendas, Lumina",
    color: "oklch(0.72 0.17 155)",
  },
  {
    quote:
      "Antes a gente perdia lead por demora. Hoje respondemos em minutos e nada cai no esquecimento.",
    name: "Carlos Eduardo",
    role: "CEO, NexEdu",
    color: "oklch(0.58 0.2 290)",
  },
  {
    quote:
      "As métricas em tempo real me dão clareza total do pipeline. Decido com dados, não com achismo.",
    name: "Fernanda Souza",
    role: "Diretora Comercial, Onda",
    color: "oklch(0.7 0.15 230)",
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Depoimentos</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Equipes de vendas que já vendem mais
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card/40 p-6">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-background"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
