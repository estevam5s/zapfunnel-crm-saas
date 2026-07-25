import { Reveal, RevealGroup, RevealItem } from "./reveal"

const steps = [
  {
    n: "01",
    title: "Conecte seu WhatsApp",
    desc: "Leia o QR Code e vincule seu número em segundos. Suas conversas começam a sincronizar automaticamente.",
  },
  {
    n: "02",
    title: "Organize seus leads",
    desc: "Cada nova conversa vira um lead no funil. Adicione tags, valor e responsável sem sair da tela.",
  },
  {
    n: "03",
    title: "Feche mais vendas",
    desc: "Acompanhe o pipeline, responda rápido com IA e veja sua taxa de conversão crescer mês a mês.",
  },
]

export function Steps() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-primary">Como funciona</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Do WhatsApp ao fechamento em 3 passos
          </h2>
        </Reveal>

        <RevealGroup className="relative mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <RevealItem key={s.n}>
              <div className="relative h-full rounded-2xl border border-border bg-card/30 p-7">
                <span className="text-5xl font-semibold tracking-tighter text-primary/25">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
