"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Reveal } from "./reveal"

type Frequency = "monthly" | "yearly"

type Plan = {
  name: string
  info: string
  price: { monthly: number; yearly: number } // yearly = total anual
  features: string[]
  cta: string
  highlighted?: boolean
}

// Anual = 12 meses com ~20% de desconto (2 meses grátis).
const y = (m: number) => Math.round(m * 12 * 0.8)

const plans: Plan[] = [
  {
    name: "Inicial",
    info: "Para experimentar e começar a vender no WhatsApp.",
    price: { monthly: 0, yearly: 0 },
    features: ["1 número de WhatsApp", "Até 50 contatos", "Funil de vendas visual", "Inbox unificado"],
    cta: "Começar grátis",
  },
  {
    name: "Starter",
    info: "Para quem está estruturando as vendas.",
    price: { monthly: 97, yearly: y(97) },
    features: ["1 número de WhatsApp", "Até 100 contatos", "Funil e etapas ilimitadas", "Histórico de 90 dias"],
    cta: "Assinar Starter",
  },
  {
    name: "Pro",
    info: "Para times que querem escalar as vendas.",
    price: { monthly: 197, yearly: y(197) },
    features: [
      "5 números de WhatsApp",
      "Contatos ilimitados",
      "Broadcast e automações",
      "Flows e respostas com IA",
      "Métricas em tempo real",
      "Suporte prioritário",
    ],
    cta: "Iniciar teste grátis",
    highlighted: true,
  },
  {
    name: "Enterprise",
    info: "Para operações de vendas de alto volume.",
    price: { monthly: 397, yearly: y(397) },
    features: [
      "Números ilimitados",
      "Usuários ilimitados",
      "API e integrações dedicadas",
      "Gerente de sucesso",
      "SLA e segurança avançada",
    ],
    cta: "Assinar Enterprise",
  },
]

const brl = (n: number) => n.toLocaleString("pt-BR")

function FrequencyToggle({ frequency, onChange }: { frequency: Frequency; onChange: (f: Frequency) => void }) {
  return (
    <div className="mx-auto flex w-fit rounded-full border border-border bg-secondary/30 p-1">
      {(["monthly", "yearly"] as Frequency[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            "relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
            frequency === f ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {frequency === f && <span className="absolute inset-0 -z-0 rounded-full bg-primary transition-all" />}
          <span className="relative z-10">{f === "monthly" ? "Mensal" : "Anual"}</span>
          {f === "yearly" && (
            <span className="relative z-10 ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              -20%
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function PricingCard({ plan, frequency }: { plan: Plan; frequency: Frequency }) {
  const value = plan.price[frequency]
  const off = plan.price.monthly > 0
    ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100)
    : 0
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all",
        plan.highlighted
          ? "border-primary/50 bg-card/70 shadow-2xl shadow-primary/10"
          : "border-border bg-card/30 hover:border-border/80",
      )}
    >
      {plan.highlighted && <span className="pr-border" aria-hidden />}

      <div className={cn("relative border-b border-border p-6", plan.highlighted && "bg-primary/[0.04]")}>
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <span className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium">
              <Star className="size-3 fill-current" /> Popular
            </span>
          )}
          {frequency === "yearly" && off > 0 && (
            <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{off}% off</span>
          )}
        </div>
        <div className="text-lg font-semibold tracking-tight">{plan.name}</div>
        <p className="mt-1 text-sm text-muted-foreground">{plan.info}</p>
        <h3 className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-bold tracking-tight">R$ {brl(value)}</span>
          {plan.price.monthly > 0 && (
            <span className="pb-1 text-sm text-muted-foreground">/{frequency === "monthly" ? "mês" : "ano"}</span>
          )}
        </h3>
      </div>

      <div className={cn("flex-1 space-y-3.5 p-6 text-sm", plan.highlighted && "bg-primary/[0.02]")}>
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{f}</span>
          </div>
        ))}
      </div>

      <div className={cn("mt-auto border-t border-border p-4", plan.highlighted && "bg-primary/[0.04]")}>
        <Link
          href="/dashboard"
          className={cn(
            "flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
            plan.highlighted
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
              : "border border-border bg-secondary/50 text-foreground hover:bg-secondary",
          )}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  )
}

export function Pricing() {
  const [frequency, setFrequency] = useState<Frequency>("monthly")
  return (
    <section id="planos" className="relative overflow-hidden py-24 sm:py-32">
      <style>{`
        @keyframes pr-trail { to { transform: rotate(1turn); } }
        .pr-border { position:absolute; inset:0; border-radius:1rem; padding:1px; pointer-events:none; z-index:0;
          background: conic-gradient(from 0deg, transparent 0deg, transparent 300deg, oklch(0.62 0.19 295) 340deg, transparent 360deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; animation: pr-trail 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .pr-border { animation: none; } }
      `}</style>
      <div className="pointer-events-none absolute right-1/4 top-1/4 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-sm font-semibold text-primary">Planos</span>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Preços simples, sem surpresas</h2>
          <p className="text-pretty text-muted-foreground">Comece de graça e evolua quando seu time crescer. No plano anual você economiza 20%.</p>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <FrequencyToggle frequency={frequency} onChange={setFrequency} />
        </div>

        <div className="mx-auto mt-12 grid w-full items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <PricingCard key={p.name} plan={p} frequency={frequency} />
          ))}
        </div>
      </div>
    </section>
  )
}
