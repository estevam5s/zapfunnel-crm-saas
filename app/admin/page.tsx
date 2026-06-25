"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { StatCard, Panel, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/admin/overview").then((r) => r.json()).then((d) => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const t = data?.totals
  const products = data?.products || []
  const totalMrr = products.reduce((s: number, p: any) => s + (p.mrr || 0), 0) || 1

  const kpis = t ? [
    { label: "Receita total", value: brl(t.revenue_total), delta: "+12%", positive: true },
    { label: "Lucro total", value: brl(t.profit_total), delta: "+9%", positive: true },
    { label: "MRR", value: brl(t.mrr), hint: `ARR ${brl(t.arr)}` },
    { label: "Clientes ativos", value: String(t.customers), hint: `${t.paying} pagantes` },
    { label: "Em teste", value: String(t.trials), hint: "trial 7 dias" },
    { label: "Cancelados", value: String(t.canceled), delta: `${t.churn}% churn`, positive: false },
    { label: "Conversão", value: `${t.conversion}%`, positive: true, delta: "média" },
    { label: "ARPU", value: brl(t.arpu), hint: `LTV ${brl(t.ltv)}` },
  ] : []

  return (
    <AdminShell title="Visão geral" subtitle="Indicadores consolidados de todos os produtos">
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((k) => <StatCard key={k.label} {...k} value={k.value} />)}
          </div>

          <Panel title="Produtos em destaque" subtitle="Maior receita recorrente">
            <ul className="flex flex-col gap-3">
              {[...products].sort((a, b) => b.mrr - a.mrr).map((p: any) => {
                const pct = Math.round((p.mrr / totalMrr) * 100)
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <StatusBadge tone={p.status === "ativo" ? "green" : "neutral"}>{p.status}</StatusBadge>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium">{brl(p.mrr)}</span>
                    <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>
      )}
    </AdminShell>
  )
}
