"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { authFetch } from "@/contexts/auth-context"

type Lead = { id: string; name: string; phone: string | null; stage: string; value: number }
const LABEL: Record<string, string> = { novo: "Novo", em_conversa: "Em conversa", qualificado: "Qualificado", proposta: "Proposta", ganho: "Ganho", perdido: "Perdido" }
const DOT: Record<string, string> = { novo: "#94a3b8", em_conversa: "#3b82f6", qualificado: "#8b5cf6", proposta: "#f59e0b", ganho: "#10b981", perdido: "#ef4444" }
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

export function RecentLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  useEffect(() => { authFetch("/api/leads").then((r) => r.ok && r.json().then((d) => setLeads((d.leads || []).slice(0, 6)))).catch(() => {}) }, [])
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">Leads recentes</h3><Link href="/funil" className="text-xs text-primary hover:underline">Ver funil</Link></div>
      {leads.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">Nenhum lead ainda. Conecte o WhatsApp.</p> :
        <div className="space-y-2">
          {leads.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-lg hover:bg-muted/40 px-2 py-2">
              <span className="grid size-8 place-items-center rounded-full bg-emerald-600/15 text-emerald-600 text-xs font-semibold">{(l.name || "?").slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{l.name}</p><p className="text-xs text-muted-foreground">{l.phone || "—"}</p></div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full" style={{ background: DOT[l.stage] }} />{LABEL[l.stage] || l.stage}</span>
              {l.value > 0 && <span className="text-xs font-medium">{brl(l.value)}</span>}
            </div>
          ))}
        </div>}
    </div>
  )
}
