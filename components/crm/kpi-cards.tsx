"use client"

import { useEffect, useState } from "react"
import { Users, MessageSquare, Wifi, Target, Loader2 } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"

type Dash = { active_leads: number; total_leads: number; conversations_today: number; connections: number; messages_7d: number; conversion: number }

export function KpiCards() {
  const [d, setD] = useState<Dash | null>(null)
  useEffect(() => { authFetch("/api/dashboard").then((r) => r.ok && r.json().then(setD)).catch(() => {}) }, [])

  const cards = [
    { label: "Leads ativos", value: d?.active_leads ?? "—", hint: `${d?.total_leads ?? 0} no total`, icon: Users },
    { label: "Conversas hoje", value: d?.conversations_today ?? "—", hint: "mensagens recebidas hoje", icon: MessageSquare },
    { label: "WhatsApp conectados", value: d?.connections ?? "—", hint: "números ativos", icon: Wifi },
    { label: "Taxa de conversão", value: d ? `${d.conversion}%` : "—", hint: `${d?.messages_7d ?? 0} msgs / 7 dias`, icon: Target },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <c.icon className="size-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-2xl font-semibold tracking-tight">{d === null ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : c.value}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
        </div>
      ))}
    </div>
  )
}
