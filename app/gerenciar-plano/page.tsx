"use client"

import { useEffect, useState } from "react"
import { Check, Zap, CreditCard, Loader2, ShieldCheck } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { useAuth, authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

function brl(cents: number) {
  // os valores em app_plans estão em CENTAVOS (ex.: 19700 = R$197)
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export default function GerenciarPlanoPage() {
  const { sub, reload } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [cycle, setCycle] = useState<"month" | "year">("month")
  const [busy, setBusy] = useState<string | null>(null)
  const [portalBusy, setPortalBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    authFetch("/api/plans").then((r) => r.json()).then((d) => setPlans(d.plans || []))
    const p = new URLSearchParams(window.location.search)
    if (p.get("success")) { setNotice("Assinatura confirmada! Obrigado."); reload() }
    if (p.get("canceled")) setNotice("Checkout cancelado.")
  }, [reload])

  const isAdmin = sub?.is_admin
  const currentSlug = isAdmin ? "enterprise" : (sub?.plan?.slug || sub?.subscription?.plan_slug || "inicial")
  const status = sub?.subscription?.status
  const isPaid = !isAdmin && currentSlug !== "inicial" && status && ["active", "trialing"].includes(status)
  const trialActive = sub?.trial_active
  const refundUntil = sub?.subscription?.refund_eligible_until

  async function subscribe(slug: string) {
    if (slug === "inicial" || slug === currentSlug) return
    setBusy(slug)
    try {
      const r = await authFetch("/api/checkout", { method: "POST", body: JSON.stringify({ slug, cycle }) })
      const d = await r.json()
      if (d.url) window.location.href = d.url; else { setNotice(d.error || "Erro ao iniciar checkout."); setBusy(null) }
    } catch { setNotice("Falha de conexão."); setBusy(null) }
  }
  async function openPortal() {
    setPortalBusy(true)
    try { const r = await authFetch("/api/portal", { method: "POST" }); const d = await r.json(); if (d.url) window.location.href = d.url; else setNotice(d.error || "Abra uma assinatura primeiro.") }
    catch { setNotice("Falha de conexão.") } finally { setPortalBusy(false) }
  }

  return (
    <AppShell title="Gerenciar plano" subtitle="Sua assinatura, uso e faturamento">
      <div className="flex w-full flex-col gap-6">
        {notice && <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">{notice}</div>}

        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                <Zap className="size-3.5" /> Plano {isAdmin ? "Enterprise" : trialActive ? "Teste Pro" : (sub?.plan?.name || "Inicial")}
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                {isAdmin ? "Conta de administrador — acesso total." : trialActive ? "Você está no teste gratuito de 7 dias com acesso ao nível Pro." : isPaid ? "Assinatura ativa." : "Plano gratuito — recursos reduzidos. Faça upgrade para liberar tudo."}
              </p>
              {sub?.trial_ends_at && trialActive && <p className="mt-1 text-xs text-muted-foreground">Teste termina em {new Date(sub.trial_ends_at).toLocaleDateString("pt-BR")}</p>}
            </div>
            {isPaid && (
              <button onClick={openPortal} disabled={portalBusy} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-secondary/60">
                {portalBusy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />} Gerenciar assinatura
              </button>
            )}
          </div>
          {refundUntil && new Date(refundUntil) > new Date() && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
              <ShieldCheck className="size-4" /> Garantia de reembolso ativa até {new Date(refundUntil).toLocaleDateString("pt-BR")}.
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Mude de plano quando quiser</h2>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
            {([["month", "Mensal"], ["year", "Anual"]] as const).map(([c, label]) => (
              <button key={c} onClick={() => setCycle(c)} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", cycle === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {label}{c === "year" && <span className="ml-1.5 text-xs opacity-80">-20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-4">
          {plans.map((p) => {
            const price = cycle === "year" ? p.price_year : p.price_month
            const isCurrent = currentSlug === p.slug
            const free = p.slug === "inicial"
            return (
              <div key={p.slug} className={cn("relative flex h-full flex-col rounded-2xl border p-6", p.highlighted ? "border-primary/50 bg-card shadow-2xl shadow-primary/10" : "border-border bg-card/40")}>
                {isCurrent && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">Seu plano</span>}
                <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-3xl font-semibold tracking-tight">{free ? "R$ 0" : brl(cycle === "year" ? Math.round(price / 12) : price)}</span>
                  {!free && <span className="pb-1 text-sm text-muted-foreground">/mês</span>}
                </div>
                <button onClick={() => subscribe(p.slug)} disabled={isCurrent || free || busy === p.slug}
                  className={cn("mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    isCurrent || free ? "cursor-default border border-border bg-secondary/60 text-muted-foreground" : p.highlighted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110" : "border border-border bg-secondary/50 hover:bg-secondary")}>
                  {busy === p.slug ? "Aguarde…" : isCurrent ? "Plano atual" : free ? "Grátis" : "Assinar"}
                </button>
                <ul className="mt-7 flex flex-col gap-3 border-t border-border pt-7">
                  {(p.features || []).map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="size-3.5" /></span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground">Pagamento seguro via Stripe · Garantia de reembolso de 7 dias · Sem cobrança por armazenamento</p>
      </div>
    </AppShell>
  )
}
