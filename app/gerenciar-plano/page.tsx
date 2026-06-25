"use client"

import { useState } from "react"
import { Check, Zap, Users, MessageCircle, CreditCard } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    monthly: 0,
    yearly: 0,
    desc: "Para quem está começando a vender no WhatsApp.",
    features: [
      "1 número de WhatsApp",
      "Até 100 leads",
      "Funil de vendas visual",
      "Inbox unificado",
    ],
    cta: "Fazer downgrade",
    highlight: false,
    current: false,
  },
  {
    name: "Pro",
    monthly: 480,
    yearly: 384,
    desc: "Para times que querem escalar as vendas.",
    features: [
      "5 números de WhatsApp",
      "Leads ilimitados",
      "Respostas com IA",
      "Automações de funil",
      "Métricas em tempo real",
      "Suporte prioritário",
    ],
    cta: "Plano atual",
    highlight: true,
    current: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    yearly: null,
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
    current: false,
  },
]

const usage = [
  { label: "Números conectados", value: 3, max: 5, icon: MessageCircle },
  { label: "Usuários no time", value: 4, max: 10, icon: Users },
  { label: "Automações ativas", value: 8, max: 25, icon: Zap },
]

function brl(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export default function GerenciarPlanoPage() {
  const [cycle, setCycle] = useState<"mensal" | "anual">("mensal")

  return (
    <AppShell
      title="Gerenciar plano"
      subtitle="Sua assinatura, uso e faturamento"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Current plan summary */}
        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                <Zap className="size-3.5" />
                Plano Pro
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {brl(480)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  /mês
                </span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Próxima cobrança em 12 de julho de 2026
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary/60">
                <CreditCard className="size-4" />
                Forma de pagamento
              </button>
              <button className="rounded-lg px-3.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                Cancelar plano
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {usage.map((u) => {
              const Icon = u.icon
              const pct = Math.round((u.value / u.max) * 100)
              return (
                <div
                  key={u.label}
                  className="rounded-xl border border-border bg-card/70 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="size-4" />
                    {u.label}
                  </div>
                  <p className="mt-2 text-lg font-semibold">
                    {u.value}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {u.max}
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Mude de plano quando quiser
          </h2>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
            {(["mensal", "anual"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  cycle === c
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
                {c === "anual" && (
                  <span className="ml-1.5 text-xs opacity-80">-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const price =
              p.monthly === null
                ? "Sob consulta"
                : cycle === "anual"
                  ? brl(p.yearly as number)
                  : brl(p.monthly)
            return (
              <div
                key={p.name}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7",
                  p.highlight
                    ? "border-primary/50 bg-card shadow-2xl shadow-primary/10"
                    : "border-border bg-card/40",
                )}
              >
                {p.current && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                    Seu plano
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {price}
                  </span>
                  {p.monthly !== null && (
                    <span className="pb-1 text-sm text-muted-foreground">
                      /mês
                    </span>
                  )}
                </div>
                <button
                  disabled={p.current}
                  className={cn(
                    "mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    p.current
                      ? "cursor-default border border-border bg-secondary/60 text-muted-foreground"
                      : p.highlight
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110"
                        : "border border-border bg-secondary/50 text-foreground hover:bg-secondary",
                  )}
                >
                  {p.cta}
                </button>
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
            )
          })}
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Histórico de faturas</h2>
          <ul className="mt-3 divide-y divide-border">
            {[
              { date: "12 jun 2026", value: 480, status: "Paga" },
              { date: "12 mai 2026", value: 480, status: "Paga" },
              { date: "12 abr 2026", value: 480, status: "Paga" },
            ].map((inv) => (
              <li
                key={inv.date}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-muted-foreground">{inv.date}</span>
                <span className="font-medium">{brl(inv.value)}</span>
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {inv.status}
                </span>
                <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Baixar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
