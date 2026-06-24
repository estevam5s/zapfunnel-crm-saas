import { TrendingUp, TrendingDown } from "lucide-react"
import { kpis } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
            <span
              className={cn(
                "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                kpi.positive
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              {kpi.positive ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {kpi.delta}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
        </div>
      ))}
    </div>
  )
}
