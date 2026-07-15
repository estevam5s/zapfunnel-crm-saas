import { Analytics } from '@vercel/analytics/next'
import ChatWidgetMount from "@/components/ChatWidgetMount";
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ZapFunnel — CRM de Vendas para WhatsApp',
  description:
    'CRM focado em vendas no WhatsApp com funil de vendas, contatos e inbox de conversas.',
  generator: 'v0.app',
  icons: { icon: "/brand-logo.png", shortcut: "/brand-logo.png", apple: "/brand-logo.png" },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0c0e14',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      <ChatWidgetMount appName="ZapFunnel" accent="#22c55e" /></body>
    </html>
  )
}
