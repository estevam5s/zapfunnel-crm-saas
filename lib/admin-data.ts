export function brl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export function num(value: number) {
  return value.toLocaleString("pt-BR")
}

// ---------------------------------------------------------------------------
// Visão geral (dashboard admin)
// ---------------------------------------------------------------------------

export type AdminKpi = {
  label: string
  value: string
  delta: string
  positive: boolean
  hint: string
}

export const overviewKpis: AdminKpi[] = [
  { label: "Receita total", value: brl(1284500), delta: "+22,4%", positive: true, hint: "acumulado no ano" },
  { label: "MRR", value: brl(118200), delta: "+8,1%", positive: true, hint: "receita recorrente mensal" },
  { label: "ARR", value: brl(1418400), delta: "+11,3%", positive: true, hint: "receita recorrente anual" },
  { label: "Clientes ativos", value: "2.847", delta: "+164", positive: true, hint: "assinaturas ativas" },
  { label: "Churn", value: "2,3%", delta: "-0,4%", positive: true, hint: "cancelamento mensal" },
  { label: "ARPU", value: brl(415), delta: "+3,2%", positive: true, hint: "receita média por usuário" },
  { label: "LTV", value: brl(8420), delta: "+5,6%", positive: true, hint: "valor do tempo de vida" },
  { label: "Em trial", value: "312", delta: "+47", positive: true, hint: "testes em andamento" },
]

export const mrrSeries = [
  { month: "Jan", mrr: 78000, novo: 12000, churn: 4200 },
  { month: "Fev", mrr: 84000, novo: 14500, churn: 3900 },
  { month: "Mar", mrr: 89500, novo: 13200, churn: 5100 },
  { month: "Abr", mrr: 95800, novo: 16800, churn: 4600 },
  { month: "Mai", mrr: 102400, novo: 18200, churn: 4100 },
  { month: "Jun", mrr: 108900, novo: 17600, churn: 5200 },
  { month: "Jul", mrr: 113500, novo: 15900, churn: 4800 },
  { month: "Ago", mrr: 118200, novo: 19400, churn: 4300 },
]

export const customersSplit = [
  { status: "Ativos", value: 2847 },
  { status: "Trial", value: 312 },
  { status: "Cancelados", value: 184 },
  { status: "Inadimplentes", value: 96 },
]

// ---------------------------------------------------------------------------
// Produtos SaaS
// ---------------------------------------------------------------------------

export type SaasProduct = {
  id: string
  name: string
  category: string
  status: "ativo" | "beta" | "pausado"
  mrr: number
  arr: number
  customers: number
  conversion: number
  churn: number
  revenue: number
  costs: number
  trend: number[]
}

export const saasProducts: SaasProduct[] = [
  {
    id: "zapfunnel",
    name: "ZapFunnel CRM",
    category: "CRM para WhatsApp",
    status: "ativo",
    mrr: 62400,
    arr: 748800,
    customers: 1480,
    conversion: 32.4,
    churn: 2.1,
    revenue: 748800,
    costs: 214000,
    trend: [42, 48, 51, 55, 60, 58, 63, 62],
  },
  {
    id: "leadflow",
    name: "LeadFlow Automations",
    category: "Automação de marketing",
    status: "ativo",
    mrr: 28800,
    arr: 345600,
    customers: 642,
    conversion: 24.8,
    churn: 3.4,
    revenue: 345600,
    costs: 118000,
    trend: [18, 20, 22, 21, 25, 27, 28, 29],
  },
  {
    id: "inboxai",
    name: "Inbox AI",
    category: "Atendimento com IA",
    status: "beta",
    mrr: 14600,
    arr: 175200,
    customers: 388,
    conversion: 19.2,
    churn: 4.8,
    revenue: 175200,
    costs: 96000,
    trend: [4, 6, 8, 9, 11, 12, 14, 15],
  },
  {
    id: "paypulse",
    name: "PayPulse",
    category: "Cobrança e pagamentos",
    status: "ativo",
    mrr: 9800,
    arr: 117600,
    customers: 214,
    conversion: 28.1,
    churn: 2.9,
    revenue: 117600,
    costs: 41000,
    trend: [5, 6, 6, 7, 8, 8, 9, 10],
  },
  {
    id: "datalens",
    name: "DataLens Analytics",
    category: "Business intelligence",
    status: "pausado",
    mrr: 2600,
    arr: 31200,
    customers: 58,
    conversion: 12.4,
    churn: 7.2,
    revenue: 31200,
    costs: 28000,
    trend: [6, 5, 5, 4, 4, 3, 3, 3],
  },
]

// ---------------------------------------------------------------------------
// Financeiro
// ---------------------------------------------------------------------------

export const financeSeries = [
  { month: "Jan", receita: 142000, despesa: 78000, investimento: 24000 },
  { month: "Fev", receita: 156000, despesa: 82000, investimento: 18000 },
  { month: "Mar", receita: 149500, despesa: 85000, investimento: 30000 },
  { month: "Abr", receita: 171000, despesa: 88000, investimento: 22000 },
  { month: "Mai", receita: 188400, despesa: 91000, investimento: 26000 },
  { month: "Jun", receita: 201900, despesa: 94000, investimento: 35000 },
  { month: "Jul", receita: 213500, despesa: 97000, investimento: 28000 },
  { month: "Ago", receita: 228200, despesa: 99500, investimento: 31000 },
]

export type ExpenseItem = { label: string; value: number }

export const expenseBreakdown: ExpenseItem[] = [
  { label: "Infraestrutura", value: 38000 },
  { label: "Equipe", value: 41000 },
  { label: "Marketing", value: 12500 },
  { label: "Ferramentas", value: 5800 },
  { label: "Outros", value: 2200 },
]

export type Transaction = {
  id: string
  description: string
  type: "receita" | "despesa" | "investimento"
  category: string
  amount: number
  date: string
  status: "pago" | "pendente" | "atrasado"
}

export const transactions: Transaction[] = [
  { id: "t1", description: "Assinaturas ZapFunnel - Agosto", type: "receita", category: "Recorrência", amount: 62400, date: "28 ago", status: "pago" },
  { id: "t2", description: "Folha de pagamento", type: "despesa", category: "Equipe", amount: 41000, date: "05 ago", status: "pago" },
  { id: "t3", description: "Servidores AWS", type: "despesa", category: "Infraestrutura", amount: 18400, date: "03 ago", status: "pago" },
  { id: "t4", description: "Campanha Meta Ads", type: "investimento", category: "Marketing", amount: 12500, date: "12 ago", status: "pago" },
  { id: "t5", description: "Assinaturas Inbox AI", type: "receita", category: "Recorrência", amount: 14600, date: "28 ago", status: "pendente" },
  { id: "t6", description: "Licenças de software", type: "despesa", category: "Ferramentas", amount: 5800, date: "08 ago", status: "atrasado" },
  { id: "t7", description: "Assinaturas LeadFlow", type: "receita", category: "Recorrência", amount: 28800, date: "28 ago", status: "pago" },
  { id: "t8", description: "Aporte em P&D", type: "investimento", category: "Produto", amount: 18500, date: "15 ago", status: "pago" },
]

// ---------------------------------------------------------------------------
// Visitantes
// ---------------------------------------------------------------------------

export type VisitorCountry = {
  code: string
  country: string
  coordinates: [number, number]
  visitors: number
}

export const visitorCountries: VisitorCountry[] = [
  { code: "BR", country: "Brasil", coordinates: [-51.9, -14.2], visitors: 18420 },
  { code: "US", country: "Estados Unidos", coordinates: [-98.5, 39.8], visitors: 9240 },
  { code: "PT", country: "Portugal", coordinates: [-8.2, 39.4], visitors: 4180 },
  { code: "ES", country: "Espanha", coordinates: [-3.7, 40.4], visitors: 2960 },
  { code: "MX", country: "México", coordinates: [-102.5, 23.6], visitors: 2480 },
  { code: "AR", country: "Argentina", coordinates: [-63.6, -38.4], visitors: 1920 },
  { code: "GB", country: "Reino Unido", coordinates: [-1.5, 52.3], visitors: 1640 },
  { code: "DE", country: "Alemanha", coordinates: [10.4, 51.1], visitors: 1280 },
  { code: "AO", country: "Angola", coordinates: [17.8, -11.2], visitors: 980 },
  { code: "IN", country: "Índia", coordinates: [78.9, 20.5], visitors: 760 },
]

export const visitorTotal = visitorCountries.reduce((s, c) => s + c.visitors, 0)

export const visitorTraffic = [
  { hour: "00h", visitas: 420 },
  { hour: "03h", visitas: 280 },
  { hour: "06h", visitas: 360 },
  { hour: "09h", visitas: 980 },
  { hour: "12h", visitas: 1240 },
  { hour: "15h", visitas: 1480 },
  { hour: "18h", visitas: 1320 },
  { hour: "21h", visitas: 860 },
]

export const trafficSources = [
  { source: "Busca orgânica", value: 42 },
  { source: "Direto", value: 24 },
  { source: "Social", value: 18 },
  { source: "Referência", value: 11 },
  { source: "E-mail", value: 5 },
]

// ---------------------------------------------------------------------------
// Monitoramento de serviços
// ---------------------------------------------------------------------------

export type ServiceStatus = {
  name: string
  status: "operacional" | "degradado" | "fora"
  uptime: number
  latency: number
  region: string
}

export const services: ServiceStatus[] = [
  { name: "API Gateway", status: "operacional", uptime: 99.98, latency: 82, region: "São Paulo" },
  { name: "Banco de dados", status: "operacional", uptime: 99.95, latency: 14, region: "São Paulo" },
  { name: "WhatsApp Webhook", status: "degradado", uptime: 99.42, latency: 340, region: "Global" },
  { name: "Processamento de pagamentos", status: "operacional", uptime: 99.99, latency: 120, region: "Global" },
  { name: "Fila de mensagens", status: "operacional", uptime: 99.96, latency: 28, region: "Virgínia" },
  { name: "Armazenamento de mídia", status: "fora", uptime: 97.10, latency: 0, region: "Frankfurt" },
]

export const latencySeries = [
  { time: "12:00", latencia: 92 },
  { time: "12:10", latencia: 88 },
  { time: "12:20", latencia: 105 },
  { time: "12:30", latencia: 140 },
  { time: "12:40", latencia: 118 },
  { time: "12:50", latencia: 96 },
  { time: "13:00", latencia: 84 },
]

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export type SeoKpi = { label: string; value: string; delta: string; positive: boolean }

export const seoKpis: SeoKpi[] = [
  { label: "Cliques orgânicos", value: "48,2 mil", delta: "+12,4%", positive: true },
  { label: "Impressões", value: "1,2 mi", delta: "+8,9%", positive: true },
  { label: "CTR médio", value: "4,1%", delta: "+0,3%", positive: true },
  { label: "Posição média", value: "8,4", delta: "-1,2", positive: true },
]

export type Keyword = {
  term: string
  position: number
  change: number
  volume: number
  clicks: number
}

export const keywords: Keyword[] = [
  { term: "crm para whatsapp", position: 3, change: 2, volume: 14800, clicks: 3240 },
  { term: "automação de vendas", position: 6, change: -1, volume: 9600, clicks: 1480 },
  { term: "funil de vendas whatsapp", position: 2, change: 4, volume: 6200, clicks: 2180 },
  { term: "chatbot atendimento", position: 11, change: 3, volume: 12400, clicks: 860 },
  { term: "disparo em massa whatsapp", position: 8, change: 0, volume: 8800, clicks: 1120 },
  { term: "integração whatsapp api", position: 5, change: 1, volume: 5400, clicks: 940 },
]

// ---------------------------------------------------------------------------
// Logs de auditoria
// ---------------------------------------------------------------------------

export type LogLevel = "info" | "aviso" | "erro" | "sucesso"

export type LogEntry = {
  id: string
  level: LogLevel
  actor: string
  action: string
  target: string
  ip: string
  time: string
}

export const logs: LogEntry[] = [
  { id: "l1", level: "sucesso", actor: "admin@zapfunnel.com", action: "Atualizou plano", target: "Produto: Inbox AI", ip: "189.45.12.8", time: "há 2 min" },
  { id: "l2", level: "info", actor: "ana@zapfunnel.com", action: "Exportou relatório financeiro", target: "Financeiro / Agosto", ip: "201.18.4.92", time: "há 18 min" },
  { id: "l3", level: "aviso", actor: "sistema", action: "Tentativas de login excedidas", target: "user: carlos@cliente.com", ip: "45.231.9.14", time: "há 41 min" },
  { id: "l4", level: "erro", actor: "sistema", action: "Falha no webhook", target: "WhatsApp Webhook", ip: "10.0.2.1", time: "há 1 h" },
  { id: "l5", level: "sucesso", actor: "admin@zapfunnel.com", action: "Criou cupom promocional", target: "BLACKFRIDAY40", ip: "189.45.12.8", time: "há 2 h" },
  { id: "l6", level: "info", actor: "bruno@zapfunnel.com", action: "Removeu usuário", target: "user: teste@dominio.com", ip: "177.92.40.3", time: "há 3 h" },
  { id: "l7", level: "aviso", actor: "sistema", action: "Uso de armazenamento em 85%", target: "Armazenamento de mídia", ip: "10.0.3.7", time: "há 4 h" },
  { id: "l8", level: "sucesso", actor: "admin@zapfunnel.com", action: "Processou reembolso", target: "Fatura #4821", ip: "189.45.12.8", time: "há 5 h" },
]
