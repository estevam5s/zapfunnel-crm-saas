import {
  KanbanSquare,
  MessageCircle,
  Bot,
  BarChart3,
  Users,
  Zap,
} from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "./reveal"

const features = [
  {
    icon: KanbanSquare,
    title: "Funil de vendas visual",
    desc: "Arraste e solte leads entre as etapas. Veja em segundos onde cada negócio está e o que falta para fechar.",
    className: "lg:col-span-2",
    highlight: true,
  },
  {
    icon: MessageCircle,
    title: "Inbox unificado",
    desc: "Todas as conversas do WhatsApp em um só lugar, com contexto completo de cada lead.",
  },
  {
    icon: Bot,
    title: "Respostas com IA",
    desc: "Sugestões inteligentes e respostas automáticas para nunca deixar um cliente esperando.",
  },
  {
    icon: BarChart3,
    title: "Métricas em tempo real",
    desc: "Acompanhe receita, conversão e tempo de resposta com dashboards claros e acionáveis.",
    className: "lg:col-span-2",
    highlight: true,
  },
  {
    icon: Users,
    title: "Gestão de contatos",
    desc: "Tags, origem e histórico de cada lead organizados automaticamente.",
  },
  {
    icon: Zap,
    title: "Automações",
    desc: "Dispare mensagens, mova etapas e atribua responsáveis sem esforço manual.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Recursos</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo que sua equipe precisa para vender no WhatsApp
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Do primeiro contato ao fechamento, o ZapFunnel mantém seu time
            organizado e focado no que importa: vender mais.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <RevealItem key={f.title} className={f.className}>
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border border-border p-6 transition-colors hover:border-primary/40 ${
                    f.highlight ? "bg-card/60" : "bg-card/30"
                  }`}
                >
                  {f.highlight && (
                    <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
                  )}
                  <div className="relative">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
