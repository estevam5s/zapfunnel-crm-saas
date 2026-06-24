"use client"

import { useMemo, useState } from "react"
import { Search, MessageCircle, Filter } from "lucide-react"
import {
  leads,
  stages,
  brl,
  type StageId,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const filters: { id: StageId | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  ...stages.map((s) => ({ id: s.id, label: s.title })),
]

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function ContactsTable() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<StageId | "all">("all")

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchFilter = filter === "all" || l.stage === filter
      const matchQuery =
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.phone.includes(query)
      return matchFilter && matchQuery
    })
  }, [query, filter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="h-10 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="size-4 shrink-0 text-muted-foreground" />
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Origem
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Tags
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Responsável
                </th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => {
                const stage = stages.find((s) => s.id === lead.stage)!
                return (
                  <tr
                    key={lead.id}
                    className="transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-primary-foreground"
                          style={{ background: lead.avatarColor }}
                        >
                          {initials(lead.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{lead.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lead.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          color: stage.accent,
                          background: "color-mix(in oklch, " + stage.accent + " 15%, transparent)",
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: stage.accent }}
                        />
                        {stage.title}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {lead.source}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {lead.owner}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {brl(lead.value)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        aria-label={"Conversar com " + lead.name}
                      >
                        <MessageCircle className="size-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum contato encontrado.
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {leads.length} contatos
      </p>
    </div>
  )
}
