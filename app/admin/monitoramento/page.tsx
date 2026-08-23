"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatCard, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Globe, Smartphone, Activity } from "lucide-react"

const statusTone: Record<string, "green" | "amber" | "red"> = { operational: "green", degraded: "amber", down: "red" }

export default function MonitoramentoPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { authFetch("/api/admin/monitoring").then((r) => r.json()).then((d) => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const v = data?.visitors
  const Bars = ({ rows }: { rows: [string, number][] }) => {
    const max = Math.max(1, ...rows.map((r) => r[1]))
    return <ul className="flex flex-col gap-2.5">{rows.map(([k, n]) => (
      <li key={k} className="flex items-center gap-3 text-sm">
        <span className="w-28 shrink-0 truncate text-muted-foreground">{k}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
        <span className="w-8 text-right font-medium">{n}</span>
      </li>
    ))}</ul>
  }

  return (
    <AdminShell title="Visitantes & monitoramento" subtitle="Acessos globais e saúde dos serviços em tempo real">
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <div className="flex flex-col gap-6">
          <Panel title="Status dos serviços" subtitle="Supabase, Stripe, API, webhooks e infraestrutura">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data.services || []).map((s: any) => (
                <div key={s.service} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <div className="flex items-center gap-2"><Activity className="size-4 text-muted-foreground" /><span className="text-sm font-medium">{s.service}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{s.latency_ms}ms</span><StatusBadge tone={statusTone[s.status] || "neutral"}>{s.status}</StatusBadge></div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Visitantes" value={String(v.total)} hint="total registrado" />
            <StatCard label="Países" value={String(v.byCountry.length)} hint="origens distintas" />
            <StatCard label="Dispositivos" value={String(v.byDevice.length)} hint="tipos" />
            <StatCard label="Fontes" value={String(v.bySource.length)} hint="canais de tráfego" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Por país"><Bars rows={v.byCountry} /></Panel>
            <Panel title="Por dispositivo"><Bars rows={v.byDevice} /></Panel>
            <Panel title="Por origem"><Bars rows={v.bySource} /></Panel>
          </div>

          <Panel title="Mapa de acessos" subtitle="Distribuição geográfica dos visitantes">
            <div className="relative overflow-hidden rounded-lg border border-border bg-secondary/20" style={{ aspectRatio: "2 / 1" }}>
              <Globe className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-border" />
              {(v.points || []).map((p: any, i: number) => {
                const x = ((p.lng + 180) / 360) * 100, y = ((90 - p.lat) / 180) * 100
                return <span key={i} title={`${p.city || ""} ${p.country || ""}`} className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20" style={{ left: `${x}%`, top: `${y}%` }} />
              })}
            </div>
          </Panel>

          <Panel title="Acessos recentes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Quando", "País", "Cidade", "Dispositivo", "Navegador", "Origem"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {(v.recent || []).slice(0, 20).map((r: any, i: number) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="px-3 py-2.5 text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                      <td className="px-3 py-2.5">{r.country || "—"}</td>
                      <td className="px-3 py-2.5">{r.city || "—"}</td>
                      <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1"><Smartphone className="size-3.5 text-muted-foreground" />{r.device}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.browser} · {r.os}</td>
                      <td className="px-3 py-2.5 capitalize text-muted-foreground">{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </AdminShell>
  )
}
