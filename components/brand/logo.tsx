"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// alturas (o mark é ~256×170, proporção ~1.5:1 — largura derivada p/ não distorcer)
const sizes = {
  sm: 40,
  md: 54,
  lg: 72,
}
const RATIO = 256 / 170
const DEFAULT_SRC = "/brand-logo.png"
// logo custom enviado pelo admin (bucket público, caminho fixo)
const CUSTOM_SRC = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand/logo.png`
  : ""

export function Logo({
  size = "md",
  withWordmark = true,
  subtitle,
  className,
}: {
  size?: keyof typeof sizes
  withWordmark?: boolean
  subtitle?: string
  className?: string
}) {
  const h = sizes[size]
  const w = Math.round(h * RATIO)
  // usa o logo custom (enviado no /admin/marca) só se ele existir; senão o padrão
  const [src, setSrc] = useState(DEFAULT_SRC)
  useEffect(() => {
    if (!CUSTOM_SRC) return
    const img = new window.Image()
    img.onload = () => setSrc(CUSTOM_SRC)
    img.src = CUSTOM_SRC
  }, [])
  return (
    <span className={cn("flex items-center gap-3", className)}>
      {/* logo com FUNDO TRANSPARENTE (sem o quadrado branco); custom sobrepõe se enviado */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="ZapFunnel"
        width={w}
        height={h}
        className="object-contain"
        style={{ width: w, height: h }}
      />
      {withWordmark && (
        <span className="leading-tight">
          <span className="block text-base font-semibold tracking-tight">
            ZapFunnel
          </span>
          {subtitle && (
            <span className="block text-xs text-muted-foreground">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
