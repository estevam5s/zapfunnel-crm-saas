import { AdminShell } from "@/components/admin/admin-shell"
import { StatCard } from "@/components/admin/ui"
import {
  MrrChart,
  CustomersSplitChart,
  ProductRevenueChart,
} from "@/components/admin/overview-charts"
import { overviewKpis, saasProducts } from "@/lib/admin-data"

export default function AdminOverviewPage() {
  const productRevenue = saasProducts
    .map((p) => ({ name: p.name, mrr: p.mrr }))
    .sort((a, b) => b.mrr - a.mrr)

  return (
    <AdminShell
      title="Visão geral"
      subtitle="Indicadores consolidados de todos os produtos"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {overviewKpis.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MrrChart />
          <CustomersSplitChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ProductRevenueChart data={productRevenue} />
          <ProductsSummary />
        </div>
      </div>
    </AdminShell>
  )
}

function ProductsSummary() {
  const totalMrr = saasProducts.reduce((s, p) => s + p.mrr, 0)
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">Produtos em destaque</h2>
      <p className="text-xs text-muted-foreground">Maior receita recorrente</p>
      <ul className="mt-4 flex flex-col gap-3">
        {[...saasProducts]
          .sort((a, b) => b.mrr - a.mrr)
          .slice(0, 4)
          .map((p) => {
            const pct = Math.round((p.mrr / totalMrr) * 100)
            return (
              <li key={p.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  {pct}%
                </span>
              </li>
            )
          })}
      </ul>
    </section>
  )
}
