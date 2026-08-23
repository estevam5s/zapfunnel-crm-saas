"use client"

import { useEffect, useState } from "react"
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"
import { authFetch } from "@/contexts/auth-context"

type Dash = {
  by_stage: Record<string, number>; won_value: number; conversion: number
  msg_series: { label: string; in: number; out: number }[]
  total_leads: number; contacts: number
}

function useDash() {
  const [d, setD] = useState<Dash | null>(null)
  useEffect(() => { authFetch("/api/dashboard").then((r) => r.ok && r.json().then(setD)).catch(() => {}) }, [])
  return d
}

const STAGE_LABEL: Record<string, string> = { novo: "Novo", em_conversa: "Em conversa", qualificado: "Qualificado", proposta: "Proposta", ganho: "Ganho", perdido: "Perdido" }
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="mt-4 h-[240px]">{children}</div>
    </div>
  )
}

export function MessagesReportChart() {
  const d = useDash()
  const data = d?.msg_series || []
  return (
    <Panel title="Mensagens (7 dias)" subtitle="Recebidas e enviadas por dia">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
            <linearGradient id="gout" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="in" name="Recebidas" stroke="#10b981" fill="url(#gin)" />
          <Area type="monotone" dataKey="out" name="Enviadas" stroke="#3b82f6" fill="url(#gout)" />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function ConversionFunnelChart() {
  const d = useDash()
  const order = ["novo", "em_conversa", "qualificado", "proposta", "ganho"]
  const data = order.map((s) => ({ stage: STAGE_LABEL[s], total: d?.by_stage?.[s] || 0 }))
  return (
    <Panel title="Funil de conversão" subtitle="Leads por estágio">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={90} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="total" name="Leads" fill="#10b981" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function SourcePieChart() {
  const d = useDash()
  const colors = ["#94a3b8", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"]
  const data = Object.entries(d?.by_stage || {}).filter(([, v]) => v > 0).map(([k, v]) => ({ name: STAGE_LABEL[k] || k, value: v }))
  return (
    <Panel title="Distribuição dos leads" subtitle="Por estágio no funil">
      {data.length === 0 ? (
        <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem leads ainda.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Panel>
  )
}

export function RevenueGoalChart() {
  const d = useDash()
  const won = (d?.won_value || 0) / 100
  const data = (d?.msg_series || []).map((m) => ({ label: m.label, total: m.in + m.out }))
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Vendas ganhas</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Valor total de negócios no estágio “Ganho”</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">{brl((d?.won_value || 0))}</p>
      <p className="mt-1 text-xs text-muted-foreground">{d?.total_leads ?? 0} leads · {d?.contacts ?? 0} contatos · conversão {d?.conversion ?? 0}%</p>
      <div className="mt-4 h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="total" name="Atividade" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
