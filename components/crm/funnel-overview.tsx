"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/contexts/auth-context"

const STAGES = [
  { id: "novo", title: "Novo", color: "#94a3b8" },
  { id: "em_conversa", title: "Em conversa", color: "#3b82f6" },
  { id: "qualificado", title: "Qualificado", color: "#8b5cf6" },
  { id: "proposta", title: "Proposta", color: "#f59e0b" },
  { id: "ganho", title: "Ganho", color: "#10b981" },
  { id: "perdido", title: "Perdido", color: "#ef4444" },
]

export function FunnelOverview() {
  const [byStage, setByStage] = useState<Record<string, number>>({})
  useEffect(() => { authFetch("/api/dashboard").then((r) => r.ok && r.json().then((d) => setByStage(d.by_stage || {}))).catch(() => {}) }, [])
  const total = Object.values(byStage).reduce((s, v) => s + v, 0) || 1
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Funil de vendas</h3>
      <div className="space-y-3">
        {STAGES.map((s) => {
          const n = byStage[s.id] || 0
          return (
            <div key={s.id}>
              <div className="flex items-center justify-between text-xs mb-1"><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: s.color }} />{s.title}</span><span className="text-muted-foreground font-medium">{n}</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(n / total) * 100}%`, background: s.color }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
