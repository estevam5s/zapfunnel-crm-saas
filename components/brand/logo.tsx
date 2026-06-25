import Image from "next/image"
import { cn } from "@/lib/utils"

const sizes = {
  sm: 32,
  md: 36,
  lg: 44,
}

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
  const px = sizes[size]
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src="/zapfunnel-logo.png"
        alt="ZapFunnel"
        width={px}
        height={px}
        priority
        className="rounded-xl"
        style={{ width: px, height: px }}
      />
      {withWordmark && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">
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
