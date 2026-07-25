"use client"

import Link from "next/link"
import { Phone, ArrowUpRight, Infinity as InfinityIcon } from "lucide-react"
import { usePlan } from "@/hooks/use-plan"

// Mostra o teto de números de WhatsApp do plano atual na página Conectar.
export function WaNumbersBanner({ connected = 0 }: { connected?: number }) {
  const { waNumbers, planName } = usePlan()

  if (waNumbers.unlimited) {
    return (
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        <Phone className="size-4 text-primary" />
        <span className="font-medium text-foreground">Números de WhatsApp ilimitados</span>
        <span className="inline-flex items-center gap-1 text-xs"><InfinityIcon className="size-3.5" /> plano {planName}</span>
      </div>
    )
  }

  const reached = connected >= waNumbers.limit
  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
      reached ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-border bg-muted/40 text-muted-foreground"
    }`}>
      <Phone className="size-4 text-primary" />
      <span className="font-medium text-foreground">{connected}/{waNumbers.limit} {waNumbers.limit === 1 ? "número" : "números"} de WhatsApp</span>
      <span className="text-xs">no plano {planName}</span>
      {reached && (
        <Link href="/gerenciar-plano" className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Conectar mais números (upgrade) <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
