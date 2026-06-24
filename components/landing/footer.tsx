import Link from "next/link"
import { Zap } from "lucide-react"

const columns = [
  {
    title: "Produto",
    links: ["Recursos", "Funil de vendas", "Inbox", "Planos"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Blog", "Carreiras", "Contato"],
  },
  {
    title: "Recursos",
    links: ["Central de ajuda", "API", "Status", "Integrações"],
  },
  {
    title: "Legal",
    links: ["Privacidade", "Termos", "Segurança", "LGPD"],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="size-5" />
              </span>
              <span className="text-base font-semibold tracking-tight">
                ZapFunnel
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              O CRM de vendas feito para o WhatsApp. Organize, responda e feche
              mais negócios.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZapFunnel. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito para equipes de vendas brasileiras.
          </p>
        </div>
      </div>
    </footer>
  )
}
