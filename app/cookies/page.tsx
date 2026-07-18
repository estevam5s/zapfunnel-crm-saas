import Link from 'next/link'
export const metadata = { title: 'Política de Cookies · ZapFunnel' }
export default function Page() {
  return (<main className="mx-auto min-h-screen max-w-3xl bg-background px-6 py-16 text-muted-foreground"><Link href="/" className="text-sm text-green-500">&larr; Voltar ao início</Link><h1 className="mt-6 text-3xl font-bold text-foreground">Política de Cookies</h1><p className="mt-2 text-sm text-muted-foreground/70">Última atualização: julho de 2026</p><div className="mt-8 space-y-6 leading-relaxed"><p>Usamos cookies essenciais para autenticação e funcionamento.</p><p>Com consentimento, usamos cookies de análise para melhorar a experiência.</p><p>Você pode aceitar ou recusar os não essenciais pelo aviso no site e gerenciar no navegador.</p></div><p className="mt-10 text-sm text-muted-foreground/70">Conexão protegida por SSL. Em conformidade com a LGPD (Lei nº 13.709/2018).</p></main>);
}
