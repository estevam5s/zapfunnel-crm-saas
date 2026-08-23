"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel, StatusBadge, Segmented } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

const tone: Record<string, "green" | "amber" | "red" | "neutral" | "violet"> = { info: "neutral", warning: "amber", error: "red", security: "violet" }

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState<"all" | "info" | "warning" | "error" | "security">("all")

  useEffect(() => {
    setLoading(true)
    authFetch(`/api/admin/logs?level=${level}`).then((r) => r.json()).then((d) => { setLogs(d.logs || []); setLoading(false) }).catch(() => setLoading(false))
  }, [level])

  return (
    <AdminShell title="Logs & auditoria" subtitle="Atividades, erros, falhas de integração e tentativas de invasão">
      <Panel
        title="Eventos do sistema"
        action={<Segmented value={level} onChange={setLevel} options={[{ id: "all", label: "Todos" }, { id: "info", label: "Info" }, { id: "warning", label: "Aviso" }, { id: "error", label: "Erro" }, { id: "security", label: "Segurança" }]} />}
      >
        {loading ? <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Quando", "Nível", "Ação", "Ator", "Alvo"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2.5"><StatusBadge tone={tone[l.level] || "neutral"}>{l.level}</StatusBadge></td>
                    <td className="px-3 py-2.5 font-medium">{l.action}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{l.actor || "sistema"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{l.target || "—"}</td>
                  </tr>
                ))}
                {!logs.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Nenhum evento registrado.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminShell>
  )
}
