import Link from "next/link"
import { Check } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "./reveal"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    price: "R$ 0",
    period: "/mês",
    desc: "Para quem está começando a vender no WhatsApp.",
    features: [
      "1 número de WhatsApp",
      "Até 100 leads",
      "Funil de vendas visual",
      "Inbox unificado",
    ],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 480",
    period: "/mês",
    desc: "Para times que querem escalar as vendas.",
    features: [
      "5 números de WhatsApp",
      "Leads ilimitados",
      "Respostas com IA",
      "Automações de funil",
      "Métricas em tempo real",
      "Suporte prioritário",
    ],
    cta: "Iniciar teste de 14 dias",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Para operações de vendas de alto volume.",
    features: [
      "Números ilimitados",
      "Usuários ilimitados",
      "API e integrações dedicadas",
      "Gerente de sucesso",
      "SLA e segurança avançada",
    ],
    cta: "Falar com vendas",
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="planos" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute right-1/4 top-1/4 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Planos</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Preços simples, sem surpresas
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Comece de graça e evolua quando seu time crescer.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <RevealItem key={p.name}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7",
                  p.highlight
                    ? "border-primary/50 bg-card/70 shadow-2xl shadow-primary/10"
                    : "border-border bg-card/30",
                )}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {p.price}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    {p.period}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className={cn(
                    "mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    p.highlight
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
                      : "border border-border bg-secondary/50 text-foreground hover:bg-secondary",
                  )}
                >
                  {p.cta}
                </Link>
                <ul className="mt-7 flex flex-col gap-3 border-t border-border pt-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="size-3.5" />
                      </span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
