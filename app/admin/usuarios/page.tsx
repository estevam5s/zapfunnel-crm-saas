"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Trash2, Ban, ShieldCheck, Plus, X } from "lucide-react"

const PLANS = ["inicial", "starter", "pro", "enterprise"]

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")

  async function load() { const r = await authFetch("/api/admin/users"); if (r.ok) setUsers((await r.json()).users || []); setLoading(false) }
  useEffect(() => { load() }, [])

  async function changePlan(id: string, plan_slug: string) { await authFetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id, plan_slug }) }); load() }
  async function toggleBlock(id: string, blocked: boolean) { await authFetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id, blocked }) }); load() }
  async function remove(id: string) { if (!confirm("Remover usuário e TODOS os seus dados? O e-mail ficará livre para novo cadastro.")) return; await authFetch(`/api/admin/users?id=${id}`, { method: "DELETE" }); load() }

  const filtered = users.filter((u) => (u.email || "").toLowerCase().includes(q.toLowerCase()) || (u.full_name || "").toLowerCase().includes(q.toLowerCase()))

  return (
    <AdminShell title="Usuários & clientes" subtitle="Crie, edite planos, bloqueie e remova contas">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por e-mail ou nome…" className="w-64 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary" />
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Plus className="size-4" /> Novo usuário</button>
      </div>
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Usuário", "Plano", "Status", "Criado", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((u) => {
                  const st = u.subscription?.status
                  return (
                    <tr key={u.id} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="px-3 py-3"><p className="font-medium">{u.email}</p><p className="text-xs text-muted-foreground">{u.full_name || "—"}</p></td>
                      <td className="px-3 py-3">
                        <select value={u.subscription?.plan_slug || u.plan_slug || "inicial"} onChange={(e) => changePlan(u.id, e.target.value)} className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs capitalize outline-none">
                          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">{u.blocked ? <StatusBadge tone="red">bloqueado</StatusBadge> : st === "active" ? <StatusBadge tone="green">ativo</StatusBadge> : st === "trialing" ? <StatusBadge tone="violet">teste</StatusBadge> : <StatusBadge tone="neutral">{st || "—"}</StatusBadge>}</td>
                      <td className="px-3 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-3"><div className="flex justify-end gap-1">
                        <button onClick={() => toggleBlock(u.id, !u.blocked)} title={u.blocked ? "Desbloquear" : "Bloquear"} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">{u.blocked ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}</button>
                        <button onClick={() => remove(u.id)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
                      </div></td>
                    </tr>
                  )
                })}
                {!filtered.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Nenhum usuário.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {open && <NewUserModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load() }} />}
    </AdminShell>
  )
}

function NewUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ email: "", password: "", full_name: "" })
  const [saving, setSaving] = useState(false); const [error, setError] = useState("")
  const inp = "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
  async function save() {
    setSaving(true); setError("")
    const r = await authFetch("/api/admin/users", { method: "POST", body: JSON.stringify(f) })
    setSaving(false); if (r.ok) onSaved(); else setError((await r.json()).error || "Erro")
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Novo usuário</h2><button onClick={onClose}><X className="size-5 text-muted-foreground" /></button></div>
        {error && <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <label className="block text-xs text-muted-foreground">Nome<input className={inp} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
          <label className="block text-xs text-muted-foreground">E-mail<input className={inp} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="block text-xs text-muted-foreground">Senha<input type="password" className={inp} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        </div>
        <button onClick={save} disabled={saving || !f.email || !f.password} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "Criando…" : "Criar usuário"}</button>
      </div>
    </div>
  )
}
