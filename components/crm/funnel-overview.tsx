import { stages, leads, brl } from "@/lib/mock-data"

export function FunnelOverview() {
  const data = stages.map((stage) => {
    const list = leads.filter((l) => l.stage === stage.id)
    return {
      ...stage,
      count: list.length,
      value: list.reduce((s, l) => s + l.value, 0),
    }
  })
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Funil de vendas</h2>
        <p className="text-xs text-muted-foreground">
          Distribuição de negócios por etapa
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {data.map((d) => (
          <li key={d.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: d.accent }}
                />
                {d.title}
              </span>
              <span className="text-muted-foreground">
                {d.count} · {brl(d.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.count / max) * 100}%`,
                  background: d.accent,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
