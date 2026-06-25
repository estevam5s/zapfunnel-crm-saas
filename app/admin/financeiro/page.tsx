"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatCard } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Plus, Trash2, X } from "lucide-react"

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const KINDS = ["receita", "despesa", "custo", "investimento"]
const toneOf: Record<string, string> = { receita: "text-primary", despesa: "text-destructive", custo: "text-chart-4", investimento: "text-accent" }

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  async function load() { const r = await authFetch("/api/admin/finance"); if (r.ok) setData(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])
  async function remove(id: string) { await authFetch(`/api/admin/finance?id=${id}`, { method: "DELETE" }); load() }

  const s = data?.summary
  return (
    <AdminShell title="Financeiro" subtitle="Receitas, despesas, custos, investimentos e lucro líquido">
      <div className="mb-4 flex justify-end"><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Plus className="size-4" /> Novo lançamento</button></div>
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Receita" value={brl(s.receita)} delta="entradas" positive />
            <StatCard label="Despesas" value={brl(s.despesa)} delta="saídas" positive={false} />
            <StatCard label="Custos op." value={brl(s.custo)} hint="servidores, APIs, ferramentas" />
            <StatCard label="Lucro líquido" value={brl(s.lucro)} delta={s.lucro >= 0 ? "positivo" : "negativo"} positive={s.lucro >= 0} />
          </div>
          <Panel title="Lançamentos">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Data", "Tipo", "Categoria", "Descrição", "Valor", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {(data.entries || []).map((e: any) => (
                    <tr key={e.id} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="px-3 py-3 text-muted-foreground">{new Date(e.entry_date).toLocaleDateString("pt-BR")}</td>
                      <td className={`px-3 py-3 font-medium capitalize ${toneOf[e.kind]}`}>{e.kind}</td>
                      <td className="px-3 py-3">{e.category || "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{e.description || "—"}{e.recurring ? " · recorrente" : ""}</td>
                      <td className="px-3 py-3 font-medium">{brl(e.amount)}</td>
                      <td className="px-3 py-3 text-right"><button onClick={() => remove(e.id)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button></td>
                    </tr>
                  ))}
                  {!data.entries?.length && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhum lançamento.</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
      {open && <EntryModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load() }} />}
    </AdminShell>
  )
}

function EntryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>({ kind: "receita", category: "", description: "", amount: 0, recurring: false })
  const [saving, setSaving] = useState(false)
  const inp = "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
  async function save() { setSaving(true); const r = await authFetch("/api/admin/finance", { method: "POST", body: JSON.stringify({ ...f, amount: Math.round(f.amount * 100) }) }); setSaving(false); if (r.ok) onSaved() }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Novo lançamento</h2><button onClick={onClose}><X className="size-5 text-muted-foreground" /></button></div>
        <div className="space-y-3">
          <label className="block text-xs text-muted-foreground">Tipo<select className={inp} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k} value={k} className="capitalize">{k}</option>)}</select></label>
          <label className="block text-xs text-muted-foreground">Categoria<input className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></label>
          <label className="block text-xs text-muted-foreground">Descrição<input className={inp} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
          <label className="block text-xs text-muted-foreground">Valor (R$)<input type="number" className={inp} value={f.amount} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={f.recurring} onChange={(e) => setF({ ...f, recurring: e.target.checked })} /> Recorrente</label>
        </div>
        <button onClick={save} disabled={saving || !f.amount} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "Salvando…" : "Adicionar"}</button>
      </div>
    </div>
  )
}
