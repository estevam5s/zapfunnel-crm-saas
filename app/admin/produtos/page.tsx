"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Plus, Trash2, X } from "lucide-react"

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export default function ProdutosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  async function load() { const r = await authFetch("/api/admin/products"); if (r.ok) setProducts((await r.json()).products || []); setLoading(false) }
  useEffect(() => { load() }, [])

  async function remove(id: string) { if (!confirm("Remover este produto?")) return; await authFetch(`/api/admin/products?id=${id}`, { method: "DELETE" }); load() }

  return (
    <AdminShell title="Produtos SaaS" subtitle="Cadastre, edite e acompanhe cada produto do ecossistema">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Plus className="size-4" /> Novo produto</button>
      </div>
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b border-border">{["Produto", "Categoria", "Status", "Clientes", "MRR", "Churn", "Lucro", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="px-3 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.domain || "—"}</p></td>
                    <td className="px-3 py-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="px-3 py-3"><StatusBadge tone={p.status === "ativo" ? "green" : "neutral"}>{p.status}</StatusBadge></td>
                    <td className="px-3 py-3">{p.customers}</td>
                    <td className="px-3 py-3 font-medium">{brl(p.mrr)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{p.churn}%</td>
                    <td className="px-3 py-3">{brl(p.profit)}</td>
                    <td className="px-3 py-3 text-right"><button onClick={() => remove(p.id)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button></td>
                  </tr>
                ))}
                {!products.length && <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Nenhum produto cadastrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {open && <ProductModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load() }} />}
    </AdminShell>
  )
}

function ProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>({ name: "", category: "", domain: "", status: "ativo", price_month: 0, customers: 0, mrr: 0, churn: 0, costs: 0, profit: 0 })
  const [saving, setSaving] = useState(false); const [error, setError] = useState("")
  async function save() {
    setSaving(true); setError("")
    const body = { ...f, price_month: Math.round(f.price_month * 100), mrr: Math.round(f.mrr * 100), costs: Math.round(f.costs * 100), profit: Math.round(f.profit * 100) }
    const r = await authFetch("/api/admin/products", { method: "POST", body: JSON.stringify(body) })
    setSaving(false); if (r.ok) onSaved(); else setError((await r.json()).error || "Erro")
  }
  const inp = "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Novo produto SaaS</h2><button onClick={onClose}><X className="size-5 text-muted-foreground" /></button></div>
        {error && <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 text-xs text-muted-foreground">Nome<input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Categoria<input className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Domínio<input className={inp} value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Preço/mês (R$)<input type="number" className={inp} value={f.price_month} onChange={(e) => setF({ ...f, price_month: +e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Clientes<input type="number" className={inp} value={f.customers} onChange={(e) => setF({ ...f, customers: +e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">MRR (R$)<input type="number" className={inp} value={f.mrr} onChange={(e) => setF({ ...f, mrr: +e.target.value })} /></label>
          <label className="text-xs text-muted-foreground">Churn (%)<input type="number" className={inp} value={f.churn} onChange={(e) => setF({ ...f, churn: +e.target.value })} /></label>
        </div>
        <button onClick={save} disabled={saving || !f.name} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "Salvando…" : "Criar produto"}</button>
      </div>
    </div>
  )
}
