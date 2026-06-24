"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { revenueSeries, messageSeries, brl } from "@/lib/mock-data"

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" }

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
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
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

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Receita ganha x perdida</h2>
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" /> Ganha
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--destructive)]" />{" "}
            Perdida
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueSeries} margin={{ left: 4, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="gGanho" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPerdido" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--destructive)"
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
              dataKey="day"
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
              dataKey="ganho"
              name="ganha"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#gGanho)"
            />
            <Area
              type="monotone"
              dataKey="perdido"
              name="perdida"
              stroke="var(--destructive)"
              strokeWidth={2}
              fill="url(#gPerdido)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function MessagesChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Volume de mensagens</h2>
          <p className="text-xs text-muted-foreground">Por horário, hoje</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--chart-2)]" /> Recebidas
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--primary)]" /> Enviadas
          </span>
        </div>
      </div>
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
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={<TooltipBox />}
              cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
            />
            <Bar
              dataKey="recebidas"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
            />
            <Bar
              dataKey="enviadas"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
