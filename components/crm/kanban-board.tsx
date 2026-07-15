"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"

type Lead = { id: string; name: string; phone: string | null; stage: string; value: number; note: string | null }
const STAGES = ["novo", "em_conversa", "qualificado", "proposta", "ganho", "perdido"] as const
const LABELS: Record<string, string> = { novo: "Novo", em_conversa: "Em conversa", qualificado: "Qualificado", proposta: "Proposta", ganho: "Ganho", perdido: "Perdido" }
const DOT: Record<string, string> = { novo: "#94a3b8", em_conversa: "#3b82f6", qualificado: "#8b5cf6", proposta: "#f59e0b", ganho: "#10b981", perdido: "#ef4444" }
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", value: "" })
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  const load = useCallback(async () => { const r = await authFetch("/api/leads"); if (r.ok) setLeads((await r.json()).leads || []); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  async function move(id: string, stage: string) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)))
    await authFetch("/api/leads", { method: "PATCH", body: JSON.stringify({ id, stage }) })
  }
  async function add(stage: string) {
    if (!form.name.trim()) return
    await authFetch("/api/leads", { method: "POST", body: JSON.stringify({ name: form.name, phone: form.phone, stage, value: Math.round(Number(form.value || 0) * 100) }) })
    setForm({ name: "", phone: "", value: "" }); setAdding(null); load()
  }
  async function remove(id: string) { await authFetch(`/api/leads?id=${id}`, { method: "DELETE" }); load() }

  // drag & drop nativo (HTML5) — arrasta o card e solta na coluna da etapa
  function onDrop(stage: string) {
    if (dragId) { const l = leads.find((x) => x.id === dragId); if (l && l.stage !== stage) move(dragId, stage) }
    setDragId(null); setOverStage(null)
  }

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const items = leads.filter((l) => l.stage === stage)
        const sum = items.reduce((s, l) => s + (l.value || 0), 0)
        return (
          <div key={stage} className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: DOT[stage] }} /> {LABELS[stage]} <span className="text-muted-foreground font-normal">{items.length}</span></span>
              <span className="text-[11px] text-muted-foreground">{brl(sum)}</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); if (overStage !== stage) setOverStage(stage) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage((s) => (s === stage ? null : s)) }}
              onDrop={() => onDrop(stage)}
              className={`space-y-2 rounded-xl p-2 min-h-[120px] transition-colors ${overStage === stage ? "bg-emerald-500/10 ring-2 ring-emerald-500/40" : "bg-muted/40"}`}
            >
              {items.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move" }}
                  onDragEnd={() => { setDragId(null); setOverStage(null) }}
                  className={`group rounded-lg bg-card border border-border p-3 cursor-grab active:cursor-grabbing ${dragId === l.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                    <button onClick={() => remove(l.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><X className="size-3.5" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">{l.phone || "—"}{l.value ? ` · ${brl(l.value)}` : ""}</p>
                  <select value={l.stage} onChange={(e) => move(l.id, e.target.value)} className="mt-2 w-full text-xs rounded-md border border-border bg-muted/50 px-2 py-1 outline-none">
                    {STAGES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
                  </select>
                </div>
              ))}
              {adding === stage ? (
                <div className="rounded-lg bg-card border border-emerald-500/40 p-3 space-y-2">
                  <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="w-full text-sm rounded-md border border-border bg-background px-2 py-1.5 outline-none" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefone" className="w-full text-sm rounded-md border border-border bg-background px-2 py-1.5 outline-none" />
                  <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Valor (R$)" type="number" className="w-full text-sm rounded-md border border-border bg-background px-2 py-1.5 outline-none" />
                  <div className="flex gap-2"><button onClick={() => add(stage)} className="flex-1 text-xs bg-emerald-600 text-white rounded-md py-1.5 font-medium">Adicionar</button><button onClick={() => setAdding(null)} className="px-2 text-muted-foreground"><X className="size-4" /></button></div>
                </div>
              ) : (
                <button onClick={() => setAdding(stage)} className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 py-2 rounded-lg hover:bg-card transition"><Plus className="size-3.5" /> Adicionar</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
