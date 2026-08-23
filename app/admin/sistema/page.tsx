"use client"

import { useEffect, useState, useRef } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatusBadge } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, Plus, Trash2, Copy, Download, Upload, Database } from "lucide-react"

const PLANS = [
  { slug: "inicial", limits: { wa_numbers: 1, contacts: 100, members: 2, automations: false, campaigns: false, api: false } },
  { slug: "starter", limits: { wa_numbers: 1, contacts: 1000, members: 4, automations: true, campaigns: false, api: false } },
  { slug: "pro", limits: { wa_numbers: 3, contacts: -1, members: 15, automations: true, campaigns: true, api: true } },
  { slug: "enterprise", limits: { wa_numbers: -1, contacts: -1, members: -1, automations: true, campaigns: true, api: true } },
]
const FEAT = [["wa_numbers", "Números WhatsApp"], ["contacts", "Contatos"], ["members", "Atendentes"], ["automations", "Automações"], ["campaigns", "Campanhas"], ["api", "API & Webhooks"]]

export default function SistemaPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const [rk, rb] = await Promise.all([authFetch("/api/admin/keys"), authFetch("/api/admin/backup?action=list")])
    if (rk.ok) setKeys((await rk.json()).keys || [])
    if (rb.ok) setBackups((await rb.json()).backups || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function createKey() { const r = await authFetch("/api/admin/keys", { method: "POST", body: JSON.stringify({ name: "API Key", scopes: ["read"] }) }); if (r.ok) { setNewSecret((await r.json()).secret); load() } }
  async function revokeKey(id: string) { await authFetch(`/api/admin/keys?id=${id}`, { method: "DELETE" }); load() }

  async function exportBackup() {
    setBusy(true)
    const { data } = await supabase.auth.getSession()
    const r = await fetch("/api/admin/backup?action=export", { headers: { Authorization: `Bearer ${data.session?.access_token}` } })
    const blob = await r.blob()
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `zapfunnel-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
    setBusy(false); load()
  }
  async function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!confirm("Restaurar a partir deste backup? Os dados serão sobrescritos.")) return
    setBusy(true)
    const text = await file.text()
    const r = await authFetch("/api/admin/backup", { method: "POST", body: text })
    setBusy(false); alert(r.ok ? `Restaurados ${(await r.json()).restored} registros.` : "Falha ao importar."); load()
  }

  return (
    <AdminShell title="API & backup" subtitle="API administrativa, auditoria de permissões e backup/restauração">
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <div className="flex flex-col gap-6">
          <Panel title="API administrativa" subtitle="Chaves de acesso para consultar produtos, métricas e finanças" action={<button onClick={createKey} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="size-3.5" /> Nova chave</button>}>
            {newSecret && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                <code className="flex-1 truncate text-xs">{newSecret}</code>
                <button onClick={() => navigator.clipboard.writeText(newSecret)} className="rounded p-1 hover:bg-secondary"><Copy className="size-4" /></button>
                <span className="text-xs text-muted-foreground">copie agora — não será exibida de novo</span>
              </div>
            )}
            <div className="mb-4 rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              Endpoint: <code className="text-foreground">GET /api/v1/&#123;products|metrics|finance|promotions&#125;</code> com header <code className="text-foreground">x-api-key</code>
            </div>
            <ul className="flex flex-col gap-2">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm">
                  <div><span className="font-medium">{k.name}</span> <code className="ml-2 text-xs text-muted-foreground">{k.key_prefix}…</code></div>
                  <div className="flex items-center gap-2">{k.revoked ? <StatusBadge tone="red">revogada</StatusBadge> : <StatusBadge tone="green">ativa</StatusBadge>}{!k.revoked && <button onClick={() => revokeKey(k.id)} className="rounded p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>}</div>
                </li>
              ))}
              {!keys.length && <li className="py-4 text-center text-sm text-muted-foreground">Nenhuma chave criada.</li>}
            </ul>
          </Panel>

          <Panel title="Backup & recuperação" subtitle="Exporte tudo ou restaure a plataforma a partir de um arquivo">
            <div className="flex flex-wrap gap-3">
              <button onClick={exportBackup} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><Download className="size-4" /> Exportar backup</button>
              <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm font-medium disabled:opacity-50"><Upload className="size-4" /> Importar / restaurar</button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importBackup} />
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {backups.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2"><Database className="size-4 text-muted-foreground" />{b.kind} · {b.tables_count} tabelas {b.note ? `· ${b.note}` : ""}</span>
                  <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString("pt-BR")}</span>
                </li>
              ))}
              {!backups.length && <li className="py-2 text-center text-sm text-muted-foreground">Nenhum backup ainda.</li>}
            </ul>
          </Panel>

          <Panel title="Auditoria de permissões por plano" subtitle="Recursos liberados para cada plano contratado">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border"><th className="px-3 py-2.5 font-medium">Recurso</th>{PLANS.map((p) => <th key={p.slug} className="px-3 py-2.5 font-medium capitalize">{p.slug}</th>)}</tr></thead>
                <tbody>
                  {FEAT.map(([key, label]) => (
                    <tr key={key} className="border-b border-border/60">
                      <td className="px-3 py-2.5 font-medium">{label}</td>
                      {PLANS.map((p) => { const v = (p.limits as any)[key]; return <td key={p.slug} className="px-3 py-2.5">{typeof v === "boolean" ? (v ? <span className="text-primary">✓</span> : <span className="text-muted-foreground">—</span>) : v === -1 ? "∞" : v}</td> })}
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
