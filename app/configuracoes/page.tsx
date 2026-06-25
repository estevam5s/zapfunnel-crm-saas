"use client"

import { useState } from "react"
import {
  SlidersHorizontal,
  Bell,
  Bot,
  ShieldCheck,
  Globe,
} from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { cn } from "@/lib/utils"

const sections = [
  { id: "geral", label: "Geral", icon: SlidersHorizontal },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "automacoes", label: "Automações", icon: Bot },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
] as const

type SectionId = (typeof sections)[number]["id"]

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function Row({
  title,
  desc,
  enabled,
  onToggle,
}: {
  title: string
  desc: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <Toggle checked={enabled} onChange={onToggle} />
    </div>
  )
}

const initialToggles: Record<string, boolean> = {
  email: true,
  push: true,
  novoLead: true,
  resumoDiario: false,
  respostaIA: true,
  distribuir: true,
  followup: false,
  twoFactor: true,
  loginAlerts: true,
}

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<SectionId>("geral")
  const [toggles, setToggles] = useState(initialToggles)

  function flip(key: string) {
    setToggles((t) => ({ ...t, [key]: !t[key] }))
  }

  return (
    <AppShell title="Configurações" subtitle="Personalize sua conta e o sistema">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section nav */}
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active === s.id
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                {s.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          {active === "geral" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold">Preferências gerais</h3>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Nome da empresa
                </span>
                <input
                  defaultValue="ZapFunnel"
                  className="h-10 rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Idioma
                </span>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select className="h-10 w-full appearance-none rounded-lg border border-input bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                    <option>Português (Brasil)</option>
                    <option>English (US)</option>
                    <option>Español</option>
                  </select>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Moeda
                </span>
                <select className="h-10 rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                  <option>Real (R$)</option>
                  <option>Dólar (US$)</option>
                  <option>Euro (€)</option>
                </select>
              </label>
            </div>
          )}

          {active === "notificacoes" && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Notificações</h3>
              <Row
                title="Notificações por e-mail"
                desc="Receba resumos e alertas importantes no seu e-mail."
                enabled={toggles.email}
                onToggle={() => flip("email")}
              />
              <Row
                title="Notificações push"
                desc="Alertas em tempo real no navegador e no app."
                enabled={toggles.push}
                onToggle={() => flip("push")}
              />
              <Row
                title="Novo lead recebido"
                desc="Seja avisado assim que um lead entrar pelo WhatsApp."
                enabled={toggles.novoLead}
                onToggle={() => flip("novoLead")}
              />
              <Row
                title="Resumo diário"
                desc="Um panorama das suas vendas todo fim de dia."
                enabled={toggles.resumoDiario}
                onToggle={() => flip("resumoDiario")}
              />
            </div>
          )}

          {active === "automacoes" && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Automações</h3>
              <Row
                title="Respostas com IA"
                desc="Sugere e envia respostas automáticas para perguntas comuns."
                enabled={toggles.respostaIA}
                onToggle={() => flip("respostaIA")}
              />
              <Row
                title="Distribuição de leads"
                desc="Distribui novos leads automaticamente entre o time."
                enabled={toggles.distribuir}
                onToggle={() => flip("distribuir")}
              />
              <Row
                title="Follow-up automático"
                desc="Envia mensagem de retomada após 24h sem resposta."
                enabled={toggles.followup}
                onToggle={() => flip("followup")}
              />
            </div>
          )}

          {active === "seguranca" && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Segurança</h3>
              <Row
                title="Autenticação em duas etapas"
                desc="Exige um código adicional ao entrar na conta."
                enabled={toggles.twoFactor}
                onToggle={() => flip("twoFactor")}
              />
              <Row
                title="Alertas de login"
                desc="Avisa quando há acesso de um novo dispositivo."
                enabled={toggles.loginAlerts}
                onToggle={() => flip("loginAlerts")}
              />
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
                <button className="self-start rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
                  Alterar senha
                </button>
                <button className="self-start rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                  Encerrar todas as sessões
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
