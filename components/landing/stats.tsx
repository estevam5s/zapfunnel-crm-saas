"use client"

import { animate, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Reveal } from "./reveal"

const stats = [
  { value: 3200, suffix: "+", label: "Equipes de vendas" },
  { value: 47, suffix: "%", label: "Mais conversões" },
  { value: 2, suffix: "M+", label: "Mensagens por mês" },
  { value: 3.2, suffix: " min", label: "Tempo médio de resposta", decimals: 1 },
]

function Counter({
  to,
  suffix,
  decimals = 0,
}: {
  to: number
  suffix?: string
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref}>
      {val.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
