import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { leads, stages, brl } from "@/lib/mock-data"

export function RecentLeads() {
  const recent = [...leads].slice(0, 6)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Leads recentes</h2>
          <p className="text-xs text-muted-foreground">Últimas interações</p>
        </div>
        <Link
          href="/contatos"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver todos <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {recent.map((lead) => {
          const stage = stages.find((s) => s.id === lead.stage)!
          return (
            <li key={lead.id} className="flex items-center gap-3 py-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                style={{ background: lead.avatarColor }}
              >
                {lead.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{lead.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {lead.lastContact} · {lead.source}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{brl(lead.value)}</p>
                <span
                  className="text-xs"
                  style={{ color: stage.accent }}
                >
                  {stage.title}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
