"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Plus, Trash2, X } from "lucide-react"

export default function PromocoesPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  async function load() { const r = await authFetch("/api/admin/promotions"); if (r.ok) setPromos((await r.json()).promotions || []); setLoading(false) }
  useEffect(() => { load() }, [])
  async function toggle(id: string, active: boolean) { await authFetch("/api/admin/promotions", { method: "PATCH", body: JSON.stringify({ id, active }) }); load() }
  async function remove(id: string) { if (!confirm("Remover promoção?")) return; await authFetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" }); load() }

  return (
    <AdminShell title="Promoções" subtitle="Cupons e ofertas temporárias integrados ao Stripe">
      <div className="mb-4 flex justify-end"><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Plus className="size-4" /> Nova promoção</button></div>
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Código", "Nome", "Desconto", "Aplica a", "Stripe", "Validade", "Status", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="px-3 py-3 font-mono font-medium">{p.code}</td>
                    <td className="px-3 py-3">{p.name}</td>
                    <td className="px-3 py-3 font-medium">{p.kind === "percent" ? `${p.amount}%` : `R$ ${(p.amount / 100).toFixed(0)}`}</td>
                    <td className="px-3 py-3 capitalize text-muted-foreground">{p.applies_to}</td>
                    <td className="px-3 py-3">{p.stripe_coupon_id ? <StatusBadge tone="violet">vinculado</StatusBadge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-3 text-muted-foreground">{p.ends_at ? new Date(p.ends_at).toLocaleDateString("pt-BR") : "sem prazo"}</td>
                    <td className="px-3 py-3"><button onClick={() => toggle(p.id, !p.active)}>{p.active ? <StatusBadge tone="green">ativa</StatusBadge> : <StatusBadge tone="neutral">inativa</StatusBadge>}</button></td>
                    <td className="px-3 py-3 text-right"><button onClick={() => remove(p.id)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button></td>
                  </tr>
                ))}
                {!promos.length && <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Nenhuma promoção.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {open && <PromoModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load() }} />}
    </AdminShell>
  )
}

function PromoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>({ code: "", name: "", kind: "percent", amount: 10, applies_to: "all", ends_at: "" })
  const [saving, setSaving] = useState(false); const [error, setError] = useState("")
  const inp = "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
  async function save() {
    setSaving(true); setError("")
    const body = { ...f, amount: f.kind === "fixed" ? Math.round(f.amount * 100) : Math.round(f.amount), ends_at: f.ends_at || null }
    const r = await authFetch("/api/admin/promotions", { method: "POST", body: JSON.stringify(body) })
    setSaving(false); if (r.ok) onSaved(); else setError((await r.json()).error || "Erro")
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Nova promoção</h2><button onClick={onClose}><X className="size-5 text-muted-foreground" /></button></div>
        {error && <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <label className="block text-xs text-muted-foreground">Código<input className={inp} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="BEMVINDO20" /></label>
          <label className="block text-xs text-muted-foreground">Nome<input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted-foreground">Tipo<select className={inp} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="percent">Percentual</option><option value="fixed">Fixo (R$)</option></select></label>
            <label className="block text-xs text-muted-foreground">{f.kind === "percent" ? "Desconto (%)" : "Desconto (R$)"}<input type="number" className={inp} value={f.amount} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></label>
          </div>
          <label className="block text-xs text-muted-foreground">Validade (opcional)<input type="date" className={inp} value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} /></label>
        </div>
        <button onClick={save} disabled={saving || !f.code} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "Criando cupom…" : "Criar promoção"}</button>
        <p className="mt-2 text-center text-xs text-muted-foreground">Um cupom é criado no Stripe automaticamente.</p>
      </div>
    </div>
  )
}
