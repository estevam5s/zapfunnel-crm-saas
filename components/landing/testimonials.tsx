import { Reveal } from "./reveal"

type Testimonial = { text: string; name: string; role: string; color: string }

const testimonials: Testimonial[] = [
  { text: "Dobramos as vendas no WhatsApp em 3 meses. O funil visual mudou completamente como o time trabalha.", name: "Mariana Lopes", role: "Head de Vendas, Lumina", color: "oklch(0.72 0.17 155)" },
  { text: "Antes a gente perdia lead por demora. Hoje respondemos em minutos e nada cai no esquecimento.", name: "Carlos Eduardo", role: "CEO, NexEdu", color: "oklch(0.58 0.2 290)" },
  { text: "As métricas em tempo real me dão clareza total do pipeline. Decido com dados, não com achismo.", name: "Fernanda Souza", role: "Diretora Comercial, Onda", color: "oklch(0.7 0.15 230)" },
  { text: "O inbox unificado acabou com a bagunça de vários celulares. Toda a equipe atende do mesmo lugar.", name: "Rafael Nunes", role: "Gestor de CS, Verde", color: "oklch(0.65 0.19 25)" },
  { text: "As automações e os flows com IA respondem o básico sozinhos. Meu time foca só no que fecha venda.", name: "Patrícia Gomes", role: "Fundadora, Belle", color: "oklch(0.68 0.16 60)" },
  { text: "Migrei da planilha para o ZapFunnel e não volto atrás. Cada lead tem histórico, etapa e responsável.", name: "Diego Martins", role: "Comercial, TechFy", color: "oklch(0.6 0.2 300)" },
  { text: "Broadcast segmentado com métricas de entrega e leitura. Minhas campanhas viraram previsíveis.", name: "Aline Ribeiro", role: "Marketing, Aurora", color: "oklch(0.72 0.15 200)" },
  { text: "Conectar o número foi questão de minutos. Em uma tarde a operação inteira já estava rodando.", name: "Bruno Almeida", role: "Diretor, Prime", color: "oklch(0.66 0.18 145)" },
  { text: "O suporte prioritário responde de verdade. Sinto que tem gente cuidando do meu resultado.", name: "Camila Duarte", role: "Head de Growth, Vibe", color: "oklch(0.62 0.2 350)" },
]

const columns = [testimonials.slice(0, 3), testimonials.slice(3, 6), testimonials.slice(6, 9)]

function Card({ t }: { t: Testimonial }) {
  return (
    <li className="group w-full max-w-xs list-none rounded-3xl border border-border bg-card/60 p-8 shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
      <blockquote className="m-0 p-0">
        <p className="m-0 text-sm leading-relaxed text-foreground/90">{t.text}</p>
        <footer className="mt-6 flex items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-background ring-2 ring-border transition-all group-hover:ring-primary/30"
            style={{ backgroundColor: t.color }}
          >
            {t.name.charAt(0)}
          </span>
          <div className="flex flex-col">
            <cite className="text-sm font-semibold not-italic leading-5 tracking-tight text-foreground">{t.name}</cite>
            <span className="mt-0.5 text-xs leading-5 tracking-tight text-muted-foreground">{t.role}</span>
          </div>
        </footer>
      </blockquote>
    </li>
  )
}

function ScrollColumn({ items, duration, className }: { items: Testimonial[]; duration: number; className?: string }) {
  return (
    <div className={className}>
      <ul className="tm-scroll flex list-none flex-col gap-6 p-0" style={{ animationDuration: `${duration}s` }}>
        {[...items, ...items].map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </ul>
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="depoimentos" className="relative overflow-hidden py-24 sm:py-32">
      <style>{`
        @keyframes tm-scroll-y { from { transform: translateY(0) } to { transform: translateY(-50%) } }
        .tm-scroll { animation-name: tm-scroll-y; animation-timing-function: linear; animation-iteration-count: infinite; }
        .tm-mask:hover .tm-scroll { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tm-scroll { animation: none; } }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-16 flex max-w-[540px] flex-col items-center text-center">
          <span className="rounded-full border border-border bg-secondary/40 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Depoimentos
          </span>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            O que dizem quem já vende mais
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Times de vendas que organizaram o WhatsApp e transformaram conversas em receita.
          </p>
        </Reveal>

        <div className="tm-mask flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <ScrollColumn items={columns[0]} duration={26} />
          <ScrollColumn items={columns[1]} duration={34} className="hidden md:block" />
          <ScrollColumn items={columns[2]} duration={30} className="hidden lg:block" />
        </div>
      </div>
    </section>
  )
}
