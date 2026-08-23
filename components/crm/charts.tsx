"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/contexts/auth-context"
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

type Dash = { msg_series: { label: string; in: number; out: number }[]; won_value: number; total_leads: number; conversion: number }
function useDash() {
  const [d, setD] = useState<Dash | null>(null)
  useEffect(() => { authFetch("/api/dashboard").then((r) => r.ok && r.json().then(setD)).catch(() => {}) }, [])
  return d
}
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
const box = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }

export function RevenueChart() {
  const d = useDash()
  const data = (d?.msg_series || []).map((m) => ({ label: m.label, total: m.in + m.out }))
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Atividade & Vendas</h3><span className="text-xs text-muted-foreground">7 dias</span></div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">{brl(d?.won_value || 0)}</p>
      <p className="text-xs text-muted-foreground">ganhos · {d?.total_leads ?? 0} leads · {d?.conversion ?? 0}% conversão</p>
      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" /><Tooltip contentStyle={box} /><Bar dataKey="total" name="Mensagens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function MessagesChart() {
  const d = useDash()
  const data = d?.msg_series || []
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Mensagens (recebidas / enviadas)</h3>
      <p className="text-xs text-muted-foreground mt-0.5">últimos 7 dias</p>
      <div className="mt-4 h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs><linearGradient id="cin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" /><YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip contentStyle={box} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="in" name="Recebidas" stroke="#10b981" fill="url(#cin)" strokeWidth={2} />
            <Area type="monotone" dataKey="out" name="Enviadas" stroke="#3b82f6" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
