"use client"

import { useEffect, useRef } from "react"

/**
 * Efeitos de scroll da landing (inspirado no pytrack):
 *  - Barra de progresso roxa fixa no topo, que preenche conforme o scroll.
 *  - Glow roxo ambiente no topo que ganha intensidade ao rolar a página.
 * Puro JS/CSS (sem dependências), com requestAnimationFrame e respeito a
 * prefers-reduced-motion.
 */
export function ScrollFX() {
  const barRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? Math.min(1, doc.scrollTop / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (glowRef.current) glowRef.current.style.opacity = String(0.35 + p * 0.5)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* barra de progresso roxa */}
      <div
        ref={barRef}
        aria-hidden
        className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg, oklch(0.6 0.2 285), oklch(0.68 0.22 320), oklch(0.6 0.2 285))",
        }}
      />
      {/* glow roxo ambiente no topo (ganha intensidade ao rolar) */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] blur-[110px] transition-opacity duration-300"
        style={{
          opacity: 0.35,
          background: "radial-gradient(60% 100% at 50% 0%, oklch(0.62 0.2 295 / 0.55), transparent 70%)",
        }}
      />
    </>
  )
}
