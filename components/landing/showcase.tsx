"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"
import { Reveal } from "./reveal"
import { brl } from "@/lib/mock-data"

const benefits = [
  "Visualize todo o pipeline em um quadro Kanban",
  "Arraste leads entre etapas com um clique",
  "Saiba o valor de cada negócio e a previsão de receita",
  "Identifique gargalos antes que virem perda",
]

const columns = [
  { title: "Novo lead", accent: "bg-chart-3", cards: [{ n: "Camila Rocha", v: 2900 }, { n: "Rafael Almeida", v: 1200 }] },
  { title: "Em conversa", accent: "bg-chart-4", cards: [{ n: "Pedro Henrique", v: 3100 }, { n: "Gustavo Lima", v: 4300 }] },
  { title: "Negociação", accent: "bg-primary", cards: [{ n: "Mariana Lopes", v: 4800 }, { n: "Lucas Pereira", v: 5600 }] },
]

export function Showcase() {
  return (
    <section id="funil" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 -z-10 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="text-sm font-semibold text-primary">Funil de vendas</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Seu pipeline inteiro, visível em um clique
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Pare de perder negócios em planilhas e conversas espalhadas. Com o
            funil visual do ZapFunnel, sua equipe sabe exatamente o que fazer em
            cada etapa.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3.5" />
                </span>
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative rounded-2xl border border-border bg-card/50 p-4 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-3 gap-3">
              {columns.map((col, ci) => (
                <div key={col.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`size-2 rounded-full ${col.accent}`} />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {col.title}
                    </span>
                  </div>
                  {col.cards.map((c, i) => (
                    <motion.div
                      key={c.n}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + ci * 0.1 + i * 0.08, duration: 0.5 }}
                      className="rounded-lg border border-border bg-background/70 p-3"
                    >
                      <p className="truncate text-xs font-medium">{c.n}</p>
                      <p className="mt-1 text-[11px] text-primary">{brl(c.v)}</p>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
