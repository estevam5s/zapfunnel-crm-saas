<div align="center">

<img src="public/brand-logo.png" alt="ZapFunnel" width="130" />

# ZapFunnel — CRM de WhatsApp com Funil e Automações

**Conecte o WhatsApp, centralize as conversas no inbox, mova leads pelo funil e automatize com fluxos e disparos — um CRM de WhatsApp completo com relatórios.**

O **ZapFunnel** é um **CRM de WhatsApp**: conecta o número (via QR Code), unifica as conversas em um **inbox**, organiza os **leads/contatos** em um **funil**, e automatiza atendimento com **fluxos**, **automações** e **broadcast** — com relatórios, integrações e planos.

🔗 **Produção:** [zapfunnel-crm.vercel.app](https://zapfunnel-crm.vercel.app)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

</div>

---

## 🎯 O que é o ZapFunnel

Um **CRM focado em WhatsApp**: transforma conversas soltas em processo comercial — inbox unificado, funil visual, automações e disparos — para vender mais sem perder lead.

## 👥 Para quem serve

- **Vendas e atendimento** que trabalham no WhatsApp.
- **Pequenas empresas** que querem organizar leads do zap.
- Quem precisa de **automação** e **broadcast** com governança.

## ✨ Funcionalidades

- **Conectar WhatsApp** — pareamento via QR Code (`/conectar`)
- **Inbox unificado** — todas as conversas num lugar (`/inbox`, `/api/conversations`)
- **Funil de vendas** — leads e etapas (`/funil`, `/api/leads`)
- **Contatos** — base de contatos (`/contatos`, `/api/contacts`)
- **Automações e fluxos** — (`/automacoes`, `/flows`, `/api/automations`)
- **Broadcast** — disparos em massa (`/broadcast`)
- **Relatórios e integrações** — (`/relatorios`, `/integracoes`)
- **Admin** — usuários, sistema, monitoramento

## 💳 Billing (Stripe)

`/api/checkout` → `/api/webhook` (assinado) → `/api/portal`. Limites por plano (números, mensagens, automações).

## 🧰 Stack tecnológica

- **Next.js** (App Router) · **React** · **TypeScript**
- **Tailwind CSS** + **@base-ui/react** + **lucide-react**
- **Supabase** (Postgres, Auth, RLS)
- **Stripe** (assinaturas) · **qrcode** (pareamento)
- **react-simple-maps / d3-geo** · **Recharts** · **Vercel**

## 🧭 Rotas principais

- **Público**: `/`, `/login`, `/2fa`
- **App**: `/dashboard`, `/conectar`, `/inbox`, `/funil`, `/contatos`, `/automacoes`, `/flows`, `/broadcast`, `/relatorios`, `/integracoes`, `/gerenciar-plano`, `/perfil`, `/configuracoes`
- **Admin**: `/admin`, `/admin/usuarios`, `/admin/sistema`, `/admin/monitoramento`
- **API**: `/api/conversations`, `/api/automations`, `/api/leads`, `/api/contacts`, `/api/dashboard`, `/api/plans`, `/api/checkout`, `/api/subscription`, `/api/portal`, `/api/webhook`, `/api/track`, `/api/profile`

## 🔐 Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Provedor de WhatsApp (Evolution/API)
WHATSAPP_API_URL=...
WHATSAPP_API_KEY=...
```

## ▶️ Como rodar localmente

```bash
npm install\ncp .env.example .env.local   # preencha as variáveis\nnpm run dev
```

## 📜 Scripts

| Script | Ação |\n|---|---|\n| `npm run dev` | desenvolvimento |\n| `npm run build` | build de produção |\n| `npm run start` | sobe o build |\n| `npm run lint` | lint |

## 🛡️ Segurança

- Autenticação e isolamento de dados por conta (RLS no Supabase).\n- Webhooks de pagamento assinados; chave `service_role` restrita ao servidor.\n- 2FA quando disponível e boas práticas de headers/CSP.

## 🗺️ Roadmap

- Chatbot com IA no inbox
- Agendamento de disparos
- Múltiplos números por conta
- Templates aprovados (WhatsApp Business API)

## 📄 Licença

Projeto proprietário. Todos os direitos reservados ao autor.

---

<div align="center">
Feito com ❤ · <a href="https://zapfunnel-crm.vercel.app">zapfunnel-crm.vercel.app</a>
</div>
