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
import { mrrSeries, customersSplit, brl, num } from "@/lib/admin-data"
import {
  Panel,
  ChartTooltip,
  Segmented,
  axisStyle,
  chartColors,
} from "./ui"

export function MrrChart() {
  const [mode, setMode] = useState<"area" | "linha">("area")

  return (
    <Panel
      title="Evolução do MRR"
      subtitle="Receita recorrente mensal por mês"
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
            <AreaChart data={mrrSeries} margin={{ left: 4, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip content={<ChartTooltip formatter={brl} />} cursor={{ stroke: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#mrrFill)"
              />
            </AreaChart>
          ) : (
            <LineChart data={mrrSeries} margin={{ left: 4, right: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip content={<ChartTooltip formatter={brl} />} cursor={{ stroke: "var(--border)" }} />
              <Line type="monotone" dataKey="novo" name="Novo MRR" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="churn" name="Churn MRR" stroke="var(--chart-5)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

export function CustomersSplitChart() {
  const [active, setActive] = useState<number | null>(null)
  const total = useMemo(
    () => customersSplit.reduce((s, d) => s + d.value, 0),
    [],
  )

  return (
    <Panel title="Base de clientes" subtitle="Distribuição por situação">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={customersSplit}
                dataKey="value"
                nameKey="status"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
                onMouseLeave={() => setActive(null)}
              >
                {customersSplit.map((_, i) => (
                  <Cell
                    key={i}
                    fill={chartColors[i % chartColors.length]}
                    opacity={active === null || active === i ? 1 : 0.35}
                    onMouseEnter={() => setActive(i)}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tracking-tight">
              {num(active === null ? total : customersSplit[active].value)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {active === null ? "total" : customersSplit[active].status}
            </span>
          </div>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {customersSplit.map((d, i) => {
            const pct = Math.round((d.value / total) * 100)
            return (
              <li
                key={d.status}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                  active === i && "bg-secondary/60",
                )}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: chartColors[i % chartColors.length] }}
                />
                <span className="flex-1">{d.status}</span>
                <span className="text-muted-foreground">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}

export function ProductRevenueChart({
  data,
}: {
  data: { name: string; mrr: number }[]
}) {
  return (
    <Panel title="MRR por produto" subtitle="Contribuição de cada SaaS" className="lg:col-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip content={<ChartTooltip formatter={brl} />} cursor={{ fill: "var(--secondary)", opacity: 0.4 }} />
            <Bar dataKey="mrr" name="MRR" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {data.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
