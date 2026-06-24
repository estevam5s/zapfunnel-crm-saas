import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/50 px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-accent/20 blur-[90px]" />
            </div>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Comece a vender mais no WhatsApp hoje
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
              Junte-se a milhares de equipes que transformaram suas conversas em
              receita previsível com o ZapFunnel.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-primary/50 hover:brightness-110"
              >
                Começar grátis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#planos"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Ver planos
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
