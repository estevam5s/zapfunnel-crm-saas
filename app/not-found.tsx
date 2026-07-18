import Link from 'next/link'
export default function NotFound() {
  return (<main className="grid min-h-screen place-items-center bg-background px-6 text-center"><div><p className="bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-7xl font-black text-transparent">404</p><h1 className="mt-4 text-2xl font-bold text-foreground">Página não encontrada</h1><p className="mt-2 text-muted-foreground">A página que você procura não existe ou foi movida.</p><Link href="/" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform hover:scale-105">Voltar ao início</Link></div></main>)
}
