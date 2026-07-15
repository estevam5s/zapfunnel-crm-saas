import type { SVGProps } from "react"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

const footerLinks = [
  {
    title: "Produto",
    links: [
      { href: "#recursos", label: "Recursos" },
      { href: "#funil", label: "Funil de vendas" },
      { href: "#funil", label: "Inbox de conversas" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "#planos", label: "Planos" },
      { href: "#", label: "Novidades" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "#", label: "Sobre nós" },
      { href: "#", label: "Blog" },
      { href: "#depoimentos", label: "Clientes" },
      { href: "#", label: "Carreiras" },
      { href: "#", label: "Imprensa" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { href: "#", label: "Central de ajuda" },
      { href: "#", label: "Primeiros passos" },
      { href: "#", label: "Documentação da API" },
      { href: "#", label: "Integrações" },
      { href: "#", label: "Status do sistema" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Termos de uso" },
      { href: "#", label: "Política de privacidade" },
      { href: "#", label: "Política de cookies" },
      { href: "#", label: "Conformidade LGPD" },
      { href: "#", label: "Segurança" },
    ],
  },
]

const socialLinks = [
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/40">
      {/* dotted grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--foreground) 8%, transparent) 0.8px, transparent 0.8px)",
          backgroundSize: "16px 16px",
          maskImage:
            "radial-gradient(circle at 50% 0%, rgba(0,0,0,0.9), rgba(0,0,0,0) 70%)",
        }}
      />
      {/* primary glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* brand + columns */}
        <div className="grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link href="/">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              O CRM de vendas feito para o WhatsApp. Organize conversas, gerencie
              seu funil e feche mais negócios sem sair do lugar.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-border/60" />

        {/* copyright */}
        <div className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
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
