"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  monthlyRevenue,
  funnelData,
  sourceData,
  messageSeries,
  brl,
} from "@/lib/mock-data"

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" }

const sourceColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function TooltipBox({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  formatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && (
        <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      )}
      {payload.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span
            className="size-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-medium text-popover-foreground">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function RevenueGoalChart() {
  const [mode, setMode] = useState<"area" | "linha">("area")

  return (
    <Panel
      title="Receita x meta"
      subtitle="Desempenho mensal do ano"
      className="lg:col-span-2"
      action={
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { id: "area", label: "Área" },
            { id: "linha", label: "Linha" },
          ]}
        />
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "area" ? (
            <AreaChart
              data={monthlyRevenue}
              margin={{ left: 4, right: 4, top: 4 }}
            >
              <defs>
                <linearGradient id="rRec" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                content={<TooltipBox formatter={brl} />}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#rRec)"
              />
              <Area
                type="monotone"
                dataKey="meta"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="transparent"
              />
            </AreaChart>
          ) : (
            <LineChart
              data={monthlyRevenue}
              margin={{ left: 4, right: 4, top: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                content={<TooltipBox formatter={brl} />}
                cursor={{ stroke: "var(--border)" }}
              />
              <Line
                type="monotone"
                dataKey="receita"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

export function SourcePieChart() {
  const [active, setActive] = useState<number | null>(null)
  const total = useMemo(
    () => sourceData.reduce((s, d) => s + d.value, 0),
    [],
  )

  return (
    <Panel title="Origem dos leads" subtitle="Distribuição por canal">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="source"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
                onMouseLeave={() => setActive(null)}
              >
                {sourceData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={sourceColors[i % sourceColors.length]}
                    opacity={active === null || active === i ? 1 : 0.35}
                    onMouseEnter={() => setActive(i)}
                  />
                ))}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tracking-tight">
              {active === null ? total : sourceData[active].value}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {active === null ? "total" : sourceData[active].source}
            </span>
          </div>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {sourceData.map((d, i) => {
            const pct = Math.round((d.value / total) * 100)
            return (
              <li
                key={d.source}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                  active === i && "bg-secondary/60",
                )}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: sourceColors[i % sourceColors.length] }}
                />
                <span className="flex-1">{d.source}</span>
                <span className="text-muted-foreground">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}

export function ConversionFunnelChart() {
  const top = funnelData[0].value
  return (
    <Panel title="Funil de conversão" subtitle="Do lead ao fechamento">
      <ul className="flex flex-col gap-3">
        {funnelData.map((d, i) => {
          const pct = Math.round((d.value / top) * 100)
          return (
            <li key={d.stage}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{d.stage}</span>
                <span className="text-muted-foreground">
                  {d.value} · {pct}%
                </span>
              </div>
              <div className="h-7 overflow-hidden rounded-lg bg-secondary">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-2 text-[11px] font-medium text-primary-foreground transition-all"
                  style={{
                    width: `${pct}%`,
                    background: sourceColors[i % sourceColors.length],
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export function MessagesReportChart() {
  return (
    <Panel
      title="Volume de mensagens"
      subtitle="Enviadas x recebidas por horário"
      className="lg:col-span-2"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={messageSeries} margin={{ left: 4, right: 4, top: 4 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              content={<TooltipBox />}
              cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            />
            <Bar
              dataKey="recebidas"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="enviadas"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
