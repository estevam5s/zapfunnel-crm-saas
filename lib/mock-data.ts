export type StageId =
  | "novo"
  | "conversa"
  | "qualificado"
  | "negociacao"
  | "ganho"
  | "perdido"

export type Lead = {
  id: string
  name: string
  phone: string
  avatarColor: string
  value: number
  stage: StageId
  source: "WhatsApp" | "Instagram" | "Indicação" | "Anúncio" | "Site"
  tags: string[]
  lastContact: string
  owner: string
  unread: number
}

export type Stage = {
  id: StageId
  title: string
  accent: string
}

export const stages: Stage[] = [
  { id: "novo", title: "Novo lead", accent: "var(--chart-3)" },
  { id: "conversa", title: "Em conversa", accent: "var(--chart-4)" },
  { id: "qualificado", title: "Qualificado", accent: "var(--chart-2)" },
  { id: "negociacao", title: "Negociação", accent: "var(--primary)" },
  { id: "ganho", title: "Ganho", accent: "var(--chart-1)" },
  { id: "perdido", title: "Perdido", accent: "var(--destructive)" },
]

const colors = [
  "oklch(0.72 0.17 155)",
  "oklch(0.58 0.2 290)",
  "oklch(0.7 0.15 230)",
  "oklch(0.78 0.16 75)",
  "oklch(0.64 0.21 25)",
  "oklch(0.7 0.12 200)",
]

function color(i: number) {
  return colors[i % colors.length]
}

export const leads: Lead[] = [
  {
    id: "1",
    name: "Mariana Lopes",
    phone: "+55 11 98472-1183",
    avatarColor: color(0),
    value: 4800,
    stage: "negociacao",
    source: "WhatsApp",
    tags: ["Quente", "Plano Pro"],
    lastContact: "há 12 min",
    owner: "Você",
    unread: 2,
  },
  {
    id: "2",
    name: "Carlos Eduardo",
    phone: "+55 21 99611-2048",
    avatarColor: color(1),
    value: 2300,
    stage: "conversa",
    source: "Instagram",
    tags: ["Morno"],
    lastContact: "há 38 min",
    owner: "Ana",
    unread: 0,
  },
  {
    id: "3",
    name: "Fernanda Souza",
    phone: "+55 31 98123-7765",
    avatarColor: color(2),
    value: 7600,
    stage: "qualificado",
    source: "Anúncio",
    tags: ["Quente", "Enterprise"],
    lastContact: "há 1 h",
    owner: "Você",
    unread: 1,
  },
  {
    id: "4",
    name: "Rafael Almeida",
    phone: "+55 41 99888-3321",
    avatarColor: color(3),
    value: 1200,
    stage: "novo",
    source: "Site",
    tags: ["Frio"],
    lastContact: "há 2 h",
    owner: "Bruno",
    unread: 3,
  },
  {
    id: "5",
    name: "Juliana Castro",
    phone: "+55 11 97654-9090",
    avatarColor: color(4),
    value: 9800,
    stage: "ganho",
    source: "Indicação",
    tags: ["Cliente"],
    lastContact: "ontem",
    owner: "Você",
    unread: 0,
  },
  {
    id: "6",
    name: "Pedro Henrique",
    phone: "+55 51 98011-5544",
    avatarColor: color(5),
    value: 3100,
    stage: "conversa",
    source: "WhatsApp",
    tags: ["Morno", "Plano Pro"],
    lastContact: "há 3 h",
    owner: "Ana",
    unread: 0,
  },
  {
    id: "7",
    name: "Beatriz Martins",
    phone: "+55 81 99234-1100",
    avatarColor: color(0),
    value: 540,
    stage: "perdido",
    source: "Anúncio",
    tags: ["Sem fit"],
    lastContact: "há 2 dias",
    owner: "Bruno",
    unread: 0,
  },
  {
    id: "8",
    name: "Lucas Pereira",
    phone: "+55 11 98765-4321",
    avatarColor: color(1),
    value: 5600,
    stage: "negociacao",
    source: "Instagram",
    tags: ["Quente"],
    lastContact: "há 25 min",
    owner: "Você",
    unread: 1,
  },
  {
    id: "9",
    name: "Camila Rocha",
    phone: "+55 19 99456-7788",
    avatarColor: color(2),
    value: 2900,
    stage: "novo",
    source: "WhatsApp",
    tags: ["Novo"],
    lastContact: "há 4 h",
    owner: "Ana",
    unread: 5,
  },
  {
    id: "10",
    name: "Thiago Nunes",
    phone: "+55 62 98321-6655",
    avatarColor: color(3),
    value: 12400,
    stage: "qualificado",
    source: "Indicação",
    tags: ["Enterprise", "Quente"],
    lastContact: "há 5 h",
    owner: "Você",
    unread: 0,
  },
  {
    id: "11",
    name: "Aline Ferreira",
    phone: "+55 11 99012-3344",
    avatarColor: color(4),
    value: 1850,
    stage: "ganho",
    source: "Site",
    tags: ["Cliente"],
    lastContact: "ontem",
    owner: "Bruno",
    unread: 0,
  },
  {
    id: "12",
    name: "Gustavo Lima",
    phone: "+55 11 98888-7777",
    avatarColor: color(5),
    value: 4300,
    stage: "conversa",
    source: "Anúncio",
    tags: ["Morno"],
    lastContact: "há 50 min",
    owner: "Você",
    unread: 2,
  },
]

export function brl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

// Dashboard KPIs
export const kpis = [
  {
    label: "Receita no funil",
    value: brl(leads.reduce((s, l) => s + l.value, 0)),
    delta: "+18,2%",
    positive: true,
    hint: "vs. mês anterior",
  },
  {
    label: "Negócios ativos",
    value: String(
      leads.filter((l) => l.stage !== "ganho" && l.stage !== "perdido").length,
    ),
    delta: "+4",
    positive: true,
    hint: "em andamento",
  },
  {
    label: "Taxa de conversão",
    value: "32,4%",
    delta: "+2,1%",
    positive: true,
    hint: "leads → ganhos",
  },
  {
    label: "Tempo de resposta",
    value: "3,2 min",
    delta: "-12,5%",
    positive: true,
    hint: "média no WhatsApp",
  },
]

export const revenueSeries = [
  { day: "Seg", ganho: 4200, perdido: 1200 },
  { day: "Ter", ganho: 5100, perdido: 900 },
  { day: "Qua", ganho: 3800, perdido: 1600 },
  { day: "Qui", ganho: 6400, perdido: 800 },
  { day: "Sex", ganho: 7200, perdido: 1100 },
  { day: "Sáb", ganho: 5600, perdido: 700 },
  { day: "Dom", ganho: 4900, perdido: 500 },
]

export const messageSeries = [
  { hour: "08h", enviadas: 32, recebidas: 41 },
  { hour: "10h", enviadas: 58, recebidas: 67 },
  { hour: "12h", enviadas: 44, recebidas: 52 },
  { hour: "14h", enviadas: 71, recebidas: 80 },
  { hour: "16h", enviadas: 64, recebidas: 73 },
  { hour: "18h", enviadas: 49, recebidas: 58 },
  { hour: "20h", enviadas: 38, recebidas: 44 },
]

export type ChatMessage = {
  id: string
  from: "me" | "them"
  text: string
  time: string
}

export type Conversation = {
  leadId: string
  messages: ChatMessage[]
}

export const conversations: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", from: "them", text: "Oi! Vi o anúncio de vocês, queria saber mais sobre o plano Pro.", time: "09:12" },
    { id: "m2", from: "me", text: "Olá, Mariana! Claro. O plano Pro inclui automações e atendimento ilimitado. Posso te enviar uma proposta?", time: "09:14" },
    { id: "m3", from: "them", text: "Pode sim! Qual o valor mensal?", time: "09:15" },
    { id: "m4", from: "me", text: "Fica R$ 480/mês com 14 dias de teste grátis. Quer que eu já libere o teste?", time: "09:16" },
    { id: "m5", from: "them", text: "Quero! Vou avaliar com o time aqui.", time: "09:18" },
  ],
  "3": [
    { id: "m1", from: "them", text: "Bom dia, preciso de uma solução para o time de vendas de 20 pessoas.", time: "08:40" },
    { id: "m2", from: "me", text: "Bom dia, Fernanda! Temos o plano Enterprise ideal para isso. Posso agendar uma demo?", time: "08:42" },
    { id: "m3", from: "them", text: "Perfeito, pode ser amanhã às 15h?", time: "08:45" },
  ],
  "4": [
    { id: "m1", from: "them", text: "Vocês atendem CNPJ?", time: "07:30" },
    { id: "m2", from: "them", text: "E tem integração com meu site?", time: "07:31" },
    { id: "m3", from: "them", text: "Aguardo retorno, obrigado.", time: "07:32" },
  ],
  "8": [
    { id: "m1", from: "them", text: "Fechei com vocês! Como faço o pagamento?", time: "10:05" },
    { id: "m2", from: "me", text: "Que ótimo, Lucas! Vou te enviar o link de pagamento agora.", time: "10:06" },
  ],
  "9": [
    { id: "m1", from: "them", text: "Oi, quero um orçamento", time: "11:00" },
    { id: "m2", from: "them", text: "Pode me ligar?", time: "11:01" },
    { id: "m3", from: "them", text: "Ainda está aí?", time: "11:20" },
    { id: "m4", from: "them", text: "Por favor me responda", time: "11:45" },
    { id: "m5", from: "them", text: "Continuo interessada", time: "12:10" },
  ],
  "12": [
    { id: "m1", from: "them", text: "Vi a demonstração, gostei bastante.", time: "13:00" },
    { id: "m2", from: "me", text: "Que bom, Gustavo! Alguma dúvida sobre os planos?", time: "13:05" },
    { id: "m3", from: "them", text: "Só o prazo de implementação mesmo.", time: "13:08" },
  ],
}
