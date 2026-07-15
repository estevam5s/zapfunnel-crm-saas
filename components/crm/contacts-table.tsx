"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, MessageCircle, Loader2, Users } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { usePlan } from "@/hooks/use-plan"
import { LimitBanner } from "@/components/crm/plan-gate"

type Contact = {
  id: string; wa_id: string; name: string; phone: string | null; avatar_url: string | null
  created_at: string; conversations: { id: string; last_message_at: string }[] | null
}

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  const [err, setErr] = useState(false)
  if (url && !err) return <img src={url} alt="" onError={() => setErr(true)} className="size-9 rounded-full object-cover bg-muted shrink-0" />
  return <div className="size-9 rounded-full bg-emerald-600 text-white grid place-items-center text-xs font-semibold shrink-0">{(name || "?").slice(0, 2).toUpperCase()}</div>
}

export function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const router = useRouter()

  const load = useCallback(async () => {
    const r = await authFetch("/api/contacts")
    if (r.ok) setContacts((await r.json()).contacts || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = contacts.filter((c) => { const s = q.toLowerCase(); return !s || (c.name || "").toLowerCase().includes(s) || (c.phone || "").includes(s) })
  const { leads } = usePlan()

  return (
    <>
    <LimitBanner used={contacts.length} limit={leads.limit} unlimited={leads.unlimited} noun="leads" requiredPlan="Pro" />
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Users className="size-4 text-emerald-600" /> {contacts.length} contatos</div>
        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou telefone…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm outline-none" />
        </div>
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground"><Users className="size-8 mx-auto mb-2 opacity-40" />{q ? "Nenhum contato encontrado." : "Nenhum contato ainda. Conecte o WhatsApp para sincronizar."}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-4 py-2.5 font-medium">Contato</th><th className="px-4 py-2.5 font-medium">Telefone</th>
              <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Última conversa</th><th className="px-4 py-2.5" />
            </tr></thead>
            <tbody>
              {filtered.map((c) => {
                const conv = c.conversations?.[0]
                return (
                  <tr key={c.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-3"><Avatar name={c.name} url={c.avatar_url} /><span className="font-medium text-foreground">{c.name || c.phone}</span></div></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.phone || c.wa_id}</td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{conv?.last_message_at ? new Date(conv.last_message_at).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => router.push("/inbox")} title="Abrir no Inbox" className="inline-grid size-8 place-items-center rounded-full bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20"><MessageCircle className="size-4" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  )
}
