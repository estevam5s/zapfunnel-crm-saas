"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowRight, MessageCircle, CheckCheck, Sparkles, Star } from "lucide-react"
import { brl } from "@/lib/mock-data"

const ease = [0.21, 0.47, 0.32, 0.98] as const

const avatars = [
  { src: "/avatars/sales-1.png", alt: "Cliente ZapFunnel" },
  { src: "/avatars/sales-2.png", alt: "Cliente ZapFunnel" },
  { src: "/avatars/sales-3.png", alt: "Cliente ZapFunnel" },
  { src: "/avatars/sales-4.png", alt: "Cliente ZapFunnel" },
  { src: "/avatars/sales-5.png", alt: "Cliente ZapFunnel" },
]

const marqueeStats = [
  { value: "+38%", label: "de conversão no funil" },
  { value: "3x", label: "mais rápido para responder" },
  { value: "R$ 12M+", label: "em vendas rastreadas" },
  { value: "2.500+", label: "times de vendas ativos" },
  { value: "1min", label: "tempo médio de resposta" },
  { value: "99,9%", label: "de uptime garantido" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute right-[6%] top-[20%] h-[360px] w-[360px] rounded-full bg-accent/25 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.a
            href="#recursos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <Sparkles className="size-3.5 text-primary" />
            Novo: respostas com IA no WhatsApp
            <ArrowRight className="size-3.5" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Transforme conversas do{" "}
            <span className="text-primary">WhatsApp</span> em vendas{" "}
            <span className="relative whitespace-nowrap text-primary">
              previsíveis
              <svg
                aria-hidden="true"
                viewBox="0 0 300 12"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary/50"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C70 3 230 3 298 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Gerencie todo o seu WhatsApp em uma só caixa de entrada: inbox
            compartilhado, funil de vendas, disparos em massa e automações
            no-code. Do primeiro "oi" ao negócio fechado, sem trocar de
            ferramenta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-primary/50 hover:brightness-110"
            >
              Começar grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#funil"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-secondary"
            >
              Ver demonstração
            </a>
          </motion.div>

          {/* social proof */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44, ease }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <div className="flex -space-x-3">
              {avatars.map((a) => (
                <span
                  key={a.src}
                  className="relative inline-block size-10 overflow-hidden rounded-full border-2 border-background bg-secondary ring-1 ring-primary/30"
                >
                  <Image
                    src={a.src || "/placeholder.svg"}
                    alt={a.alt}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <div className="flex items-center gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">+2.500 times</span>{" "}
                vendem mais com o ZapFunnel
              </p>
            </div>
          </motion.div>
        </div>

        <HeroMockup />
      </div>

      <StatsMarquee />
    </section>
  )
}

function StatsMarquee() {
  const items = [...marqueeStats, ...marqueeStats]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="group/marquee relative mt-16 flex overflow-hidden border-y border-border bg-card/40 py-4 backdrop-blur-sm"
      style={{ ["--marquee-gap" as string]: "3rem", ["--marquee-duration" as string]: "40s" }}
    >
      <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
        {items.map((stat, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="font-mono text-base font-bold tracking-tight text-primary">
              {stat.value}
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </span>
            <span className="ml-3 size-1.5 rounded-full bg-primary/40" />
          </div>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </motion.div>
  )
}

function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl backdrop-blur-xl">
        {/* window bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-3 rounded-full bg-destructive/70" />
          <span className="size-3 rounded-full bg-chart-4/70" />
          <span className="size-3 rounded-full bg-primary/70" />
          <span className="ml-3 text-xs text-muted-foreground">
            app.zapfunnel.com/funil
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
          {/* chat column */}
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="size-4 text-primary" />
              Conversa
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Bubble side="them">Oi! Vi o anúncio, queria o plano Pro.</Bubble>
              <Bubble side="me">Claro! Posso liberar seu teste grátis agora 🚀</Bubble>
              <Bubble side="them">Perfeito, pode mandar!</Bubble>
            </div>
          </div>

          {/* funnel column */}
          <div className="rounded-xl border border-border bg-background/60 p-4 sm:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Funil de vendas</span>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                +18,2% este mês
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FunnelCol title="Em conversa" count={8} value={14200} colorClass="bg-chart-4" />
              <FunnelCol title="Negociação" count={5} value={23800} colorClass="bg-primary" />
              <FunnelCol title="Ganho" count={12} value={48600} colorClass="bg-chart-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Bubble({ side, children }: { side: "me" | "them"; children: React.ReactNode }) {
  const me = side === "me"
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          me
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-secondary text-foreground"
        }`}
      >
        {children}
        {me && (
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] opacity-80">
            12:14 <CheckCheck className="size-3" />
          </span>
        )}
      </div>
    </div>
  )
}

function FunnelCol({
  title,
  count,
  value,
  colorClass,
}: {
  title: string
  count: number
  value: number
  colorClass: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${colorClass}`} />
        <span className="text-[11px] text-muted-foreground">{title}</span>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight">{count}</p>
      <p className="text-[11px] text-muted-foreground">{brl(value)}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        <span className="h-1.5 w-full rounded-full bg-secondary" />
        <span className="h-1.5 w-2/3 rounded-full bg-secondary" />
      </div>
    </div>
  )
}
