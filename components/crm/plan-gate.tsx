"use client"

import Link from "next/link"
import { Lock, Sparkles, ArrowUpRight } from "lucide-react"
import { usePlan, type FeatureKey, FEATURE_LABEL } from "@/hooks/use-plan"
import { cn } from "@/lib/utils"

// Badge "Pro"/"Enterprise" para marcar itens bloqueados no menu/UI.
export function PlanBadge({ feature, className }: { feature: FeatureKey; className?: string }) {
  const { requiredPlanLabel } = usePlan()
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent", className)}>
      <Lock className="size-2.5" /> {requiredPlanLabel(feature)}
    </span>
  )
}

// Envolve uma feature: se o plano libera → renderiza children;
// senão → mostra um card de upgrade elegante (não quebra o app).
export function PlanGate({
  feature,
  title,
  description,
  children,
}: {
  feature: FeatureKey
  title?: string
  description?: string
  children: React.ReactNode
}) {
  const { can, requiredPlanLabel, planName } = usePlan()
  if (can(feature)) return <>{children}</>

  const label = FEATURE_LABEL[feature]
  const req = requiredPlanLabel(feature)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] to-primary/[0.05]" />
      <div className="relative mx-auto max-w-md">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Sparkles className="size-7" />
        </span>
        <h3 className="text-lg font-bold text-foreground">{title ?? label}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description ?? `Este recurso faz parte do plano ${req}. Seu plano atual é o ${planName}.`}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Lock className="size-3" /> Disponível no plano {req}
        </div>
        <div className="mt-6">
          <Link
            href="/gerenciar-plano"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Fazer upgrade para {req} <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Faixa fina de aviso de limite (ex.: leads/números atingiram o teto do plano).
export function LimitBanner({
  used,
  limit,
  unlimited,
  noun,
  requiredPlan = "Pro",
}: {
  used: number
  limit: number
  unlimited?: boolean
  noun: string
  requiredPlan?: string
}) {
  if (unlimited) return null
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const reached = used >= limit
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
      reached ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "border-border bg-muted/40 text-muted-foreground")}>
      <span className="font-medium">
        {used}/{limit} {noun}
      </span>
      <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-foreground/10 sm:block" aria-hidden>
        <span className={cn("block h-full rounded-full", reached ? "bg-amber-500" : "bg-primary")} style={{ width: `${pct}%` }} />
      </span>
      {reached && (
        <Link href="/gerenciar-plano" className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Fazer upgrade para {requiredPlan} <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
