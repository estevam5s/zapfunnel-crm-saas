"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { KpiCards } from "@/components/crm/kpi-cards"
import {
  RevenueGoalChart,
  SourcePieChart,
  ConversionFunnelChart,
  MessagesReportChart,
} from "@/components/crm/report-charts"
import { cn } from "@/lib/utils"

const periods = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "ano", label: "Ano" },
] as const

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]["id"]>("30d")

  return (
    <AppShell
      title="Relatórios"
      subtitle="Acompanhe o desempenho das suas vendas"
    >
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>

        <KpiCards />

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <RevenueGoalChart />
          <SourcePieChart />
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <MessagesReportChart />
          <ConversionFunnelChart />
        </div>
      </div>
    </AppShell>
  )
}
