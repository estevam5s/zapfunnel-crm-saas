"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import {
  RefreshCw,
  Smartphone,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "loading" | "ready" | "expired" | "scanning" | "connected"

const steps = [
  "Abra o WhatsApp no seu celular",
  "Toque em Menu ou Configurações e selecione Aparelhos conectados",
  "Toque em Conectar um aparelho",
  "Aponte a câmera para esta tela para ler o código",
]

function randomToken() {
  return `zapfunnel://link?token=${Math.random()
    .toString(36)
    .slice(2)}-${Date.now().toString(36)}`
}

export function WhatsappConnect() {
  const [status, setStatus] = useState<Status>("loading")
  const [dataUrl, setDataUrl] = useState<string>("")
  const [seconds, setSeconds] = useState(40)
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generate = useCallback(async () => {
    setStatus("loading")
    const token = randomToken()
    try {
      const url = await QRCode.toDataURL(token, {
        margin: 1,
        width: 320,
        color: { dark: "#0c0e14", light: "#ffffff" },
      })
      setDataUrl(url)
      setSeconds(40)
      setStatus("ready")
    } catch {
      setStatus("expired")
    }
  }, [])

  useEffect(() => {
    generate()
  }, [generate])

  // countdown / expiration
  useEffect(() => {
    if (status !== "ready") return
    if (seconds <= 0) {
      setStatus("expired")
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [status, seconds])

  // simulate a scan happening while the code is active
  useEffect(() => {
    if (status !== "ready") return
    scanTimer.current = setTimeout(() => setStatus("scanning"), 9000)
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current)
    }
  }, [status])

  useEffect(() => {
    if (status !== "scanning") return
    const t = setTimeout(() => setStatus("connected"), 2600)
    return () => clearTimeout(t)
  }, [status])

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
      {/* QR panel */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center md:p-8">
        <div className="relative flex size-[260px] items-center justify-center overflow-hidden rounded-2xl bg-white p-3 sm:size-[300px]">
          {dataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl || "/placeholder.svg"}
              alt="QR Code para conectar o WhatsApp"
              className={cn(
                "size-full transition-all duration-300",
                (status === "expired" || status === "loading") &&
                  "blur-sm opacity-40",
              )}
            />
          )}

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {status === "expired" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70">
              <p className="text-sm font-medium text-[#0c0e14]">
                O código expirou
              </p>
              <button
                onClick={generate}
                className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
              >
                <RefreshCw className="size-4" />
                Gerar novo código
              </button>
            </div>
          )}

          {status === "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0c0e14]/85 text-white">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm font-medium">Lendo código...</p>
            </div>
          )}

          {status === "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground">
              <CheckCircle2 className="size-12" />
              <p className="text-sm font-semibold">Conectado!</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm">
          {status === "connected" ? (
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <Wifi className="size-4" />
              Número conectado com sucesso
            </span>
          ) : status === "ready" ? (
            <span className="text-muted-foreground">
              O código expira em{" "}
              <span className="font-semibold text-foreground">{seconds}s</span>
            </span>
          ) : status === "scanning" ? (
            <span className="text-muted-foreground">
              Confirme a conexão no seu celular
            </span>
          ) : status === "loading" ? (
            <span className="text-muted-foreground">Gerando código...</span>
          ) : (
            <span className="text-muted-foreground">Código indisponível</span>
          )}
        </div>

        {status !== "connected" && (
          <button
            onClick={generate}
            disabled={status === "loading"}
            className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={cn("size-4", status === "loading" && "animate-spin")}
            />
            Atualizar QR Code
          </button>
        )}
      </div>

      {/* Instructions / status panel */}
      <div className="flex flex-col gap-4 md:gap-6">
        {status === "connected" ? (
          <div className="flex flex-1 flex-col justify-center rounded-xl border border-primary/40 bg-primary/5 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              WhatsApp conectado
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Seu número +55 11 99999-0001 está sincronizado. As conversas vão
              aparecer no Inbox e os leads no funil automaticamente.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Status", value: "Online" },
                { label: "Sincronizadas", value: "1.248" },
                { label: "Latência", value: "0,3s" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <p className="text-sm font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Smartphone className="size-5 text-primary" />
              <h2 className="text-sm font-semibold">
                Como conectar seu número
              </h2>
            </div>
            <ol className="mt-5 flex flex-col gap-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="rounded-xl border border-border bg-secondary/30 p-5">
          <p className="text-sm font-medium">Números conectados</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Você usou {status === "connected" ? 4 : 3} de 5 números do plano Pro.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: status === "connected" ? "80%" : "60%" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
