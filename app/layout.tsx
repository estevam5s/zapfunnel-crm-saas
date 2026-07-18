import { Analytics } from '@vercel/analytics/next'
import ChatWidgetMount from "@/components/ChatWidgetMount";
import { CookieConsent } from "@/components/cookie-consent";
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { createAdminClient } from '@/lib/supabase'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const SITE = 'https://zapfunnel-crm.vercel.app'
const DESC = 'CRM focado em vendas no WhatsApp: funil de vendas visual, contatos, inbox de conversas, automações e disparos. Organize seus leads e venda mais pelo zap.'
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'ZapFunnel — CRM de Vendas para WhatsApp', template: '%s · ZapFunnel' },
  description: DESC,
  keywords: ['CRM WhatsApp', 'funil de vendas WhatsApp', 'automação WhatsApp', 'inbox WhatsApp', 'gestão de leads', 'vendas pelo WhatsApp'],
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: { icon: "/brand-logo.png", shortcut: "/brand-logo.png", apple: "/brand-logo.png" },
  openGraph: { type: 'website', locale: 'pt_BR', url: SITE, siteName: 'ZapFunnel', title: 'ZapFunnel — CRM de Vendas para WhatsApp', description: DESC, images: [{ url: `${SITE}/brand-logo.png`, width: 1200, height: 630, alt: 'ZapFunnel' }] },
  twitter: { card: 'summary_large_image', title: 'ZapFunnel — CRM de Vendas para WhatsApp', description: DESC, images: [`${SITE}/brand-logo.png`] },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0c0e14',
}

async function brandCss(): Promise<string> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return ''
    const { data } = await createAdminClient().from('brand_settings').select('*').eq('id', 1).maybeSingle()
    if (!data) return ''
    const v: string[] = []
    const map: Record<string, string> = { logo_site_px: '--logo-site', logo_login_px: '--logo-login', logo_dashboard_px: '--logo-dashboard', logo_admin_px: '--logo-admin', favicon_px: '--favicon-size' }
    for (const [col, cssvar] of Object.entries(map)) if ((data as any)[col]) v.push(`${cssvar}:${(data as any)[col]}px`)
    return v.length ? `:root{${v.join(';')}}` : ''
  } catch { return '' }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const css = await brandCss()
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      {css && <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>}
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      <ChatWidgetMount appName="ZapFunnel" accent="#22c55e" /><CookieConsent /></body>
    </html>
  )
}
