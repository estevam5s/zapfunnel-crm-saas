"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { AppShell } from "@/components/crm/app-shell"
import { PlanGate } from "@/components/crm/plan-gate"
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

const STAGE_LABEL: Record<string, string> = {
  novo: "Novo", em_conversa: "Em conversa", qualificado: "Qualificado",
  proposta: "Proposta enviada", ganho: "Fechado ganho", perdido: "Fechado perdido",
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "")
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = "﻿" + rows.map((r) => r.map(esc).join(";")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]["id"]>("30d")
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await authFetch("/api/dashboard")
      const d = await res.json()
      const rows: (string | number)[][] = []
      const hoje = new Date().toLocaleDateString("pt-BR")
      rows.push(["Relatório ZapFunnel", `Período: ${period}`, `Gerado em: ${hoje}`])
      rows.push([])
      rows.push(["Indicador", "Valor"])
      rows.push(["Leads ativos", d.active_leads ?? 0])
      rows.push(["Total de leads", d.total_leads ?? 0])
      rows.push(["Conversas hoje", d.conversations_today ?? 0])
      rows.push(["WhatsApp conectados", d.connections ?? 0])
      rows.push(["Mensagens (7d)", d.messages_7d ?? 0])
      rows.push(["Conversão (%)", d.conversion ?? 0])
      rows.push(["Receita ganha (R$)", d.won_value ?? 0])
      rows.push([])
      rows.push(["Leads por etapa do funil", ""])
      rows.push(["Etapa", "Quantidade"])
      Object.entries(d.by_stage || {}).forEach(([k, v]) => rows.push([STAGE_LABEL[k] || k, Number(v)]))
      rows.push([])
      rows.push(["Mensagens por dia", ""])
      rows.push(["Dia", "Recebidas", "Enviadas"])
      ;(d.msg_series || []).forEach((m: { label: string; in: number; out: number }) =>
        rows.push([m.label, m.in ?? 0, m.out ?? 0]),
      )
      downloadCsv(`relatorio-zapfunnel-${period}-${new Date().toISOString().slice(0, 10)}.csv`, rows)
    } catch {
      alert("Não foi possível exportar o relatório. Tente novamente.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <AppShell
      title="Relatórios"
      subtitle="Acompanhe o desempenho das suas vendas"
    >
      <PlanGate
        feature="realTimeMetrics"
        title="Métricas em tempo real"
        description="Relatórios de conversão, receita, origem dos leads e desempenho por atendente — atualizados em tempo real. Disponível a partir do plano Pro."
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
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span className="hidden sm:inline">{exporting ? "Exportando…" : "Exportar CSV"}</span>
          </button>
        </div>

        <KpiCards />

        {/* Linha 1: meta de receita (larga) + origem dos leads */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueGoalChart /></div>
          <SourcePieChart />
        </div>

        {/* Linha 2: mensagens (larga) + funil de conversão */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><MessagesReportChart /></div>
          <ConversionFunnelChart />
        </div>
      </div>
      </PlanGate>
    </AppShell>
  )
}
