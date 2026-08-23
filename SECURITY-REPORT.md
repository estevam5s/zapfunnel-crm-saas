# Relatório de Segurança da Informação — .

**Data:** 2026-07-02 22:27 · **Score:** 74/100 (nota **C**) · **Findings:** 20

| Severidade | Qtd |
|---|---|
| critical | 0 |
| high | 0 |
| medium | 2 |
| low | 8 |
| info | 10 |

## Sumário executivo

Nenhuma vulnerabilidade crítica detectada pelos scanners automáticos. Revisar findings de severidade Alta.

## Findings

### [MEDIUM] CSP ausente
- **OWASP:** A03 Injection
- **Nota/Correção:** definir Content-Security-Policy (mitiga XSS)

### [MEDIUM] Clickjacking
- **OWASP:** A05 Security Misconfiguration
- **Nota/Correção:** sem X-Frame-Options nem frame-ancestors

### [LOW] X-Content-Type-Options
- **OWASP:** A05 Security Misconfiguration
- **Nota/Correção:** definir nosniff

### [LOW] CORS aberto
- **OWASP:** A05 Security Misconfiguration
- **Nota/Correção:** ACAO=* 

### [LOW] Supabase service_role JWT
- **OWASP:** A01 Broken Access Control
- **Local:** `.env.local:4`
- **Evidência:** `eyJhbGciOiJI…(219 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [LOW] Stripe secret key
- **OWASP:** A02/A07 Cryptographic Failures / Secrets
- **Local:** `.env.local:9`
- **Evidência:** `sk_live_51Tn…(107 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [LOW] Stripe webhook secret
- **OWASP:** A02/A07 Cryptographic Failures / Secrets
- **Local:** `.env.local:10`
- **Evidência:** `whsec_g4sENK…(38 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [LOW] Supabase mgmt PAT
- **OWASP:** A02/A07 Cryptographic Failures / Secrets
- **Local:** `.env.local:5`
- **Evidência:** `sbp_0d2c83e0…(44 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [LOW] Supabase service_role JWT
- **OWASP:** A01 Broken Access Control
- **Local:** `supabase.txt:8`
- **Evidência:** `eyJhbGciOiJI…(219 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [LOW] Supabase mgmt PAT
- **OWASP:** A02/A07 Cryptographic Failures / Secrets
- **Local:** `supabase.txt:9`
- **Evidência:** `sbp_0d2c83e0…(44 chars)`
- **Nota/Correção:** gitignored (não vai ao repo) — mitigado; ainda assim mover p/ env/secret manager e verificar histórico git

### [INFO] Webhook valida assinatura: /api/webhook
- **OWASP:** A08 Software & Data Integrity
- **Nota/Correção:** rejeita sem assinatura (400) — OK

### [INFO] Referrer-Policy ausente
- **OWASP:** A05 Security Misconfiguration
- **Nota/Correção:** definir no-referrer/strict-origin

### [INFO] Permissions-Policy ausente
- **OWASP:** A05 Security Misconfiguration
- **Nota/Correção:** restringir APIs do browser

### [INFO] Tabela acessível (0 linhas): profiles
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Tabela acessível (0 linhas): contacts
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Tabela acessível (0 linhas): leads
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Tabela acessível (0 linhas): messages
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Tabela acessível (0 linhas): conversations
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Tabela acessível (0 linhas): audit_logs
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 200 sem linhas — RLS provavelmente OK (ou vazia)

### [INFO] Resumo Supabase
- **OWASP:** A01 Broken Access Control
- **Nota/Correção:** 6 tabelas candidatas acessíveis, 0 com LEITURA anônima de dados

## Plano de correção (prioridade)

1. **Crítico** — rotacionar segredos vazados + remover do código/histórico; fechar acesso anônimo (RLS).
2. **Alto** — cookies Secure/HttpOnly/SameSite, auth em rotas, XSS/redirect, webhook Stripe, deps CVE.
3. **Médio** — headers (HSTS/CSP/X-Frame), CORS restrito, rate limiting.
4. **Baixo/Info** — hardening incremental, remover headers de versão, Permissions-Policy.

> Após corrigir, reexecute os scanners (retest) para validar. Alinhado a OWASP Top 10 2021 / NIST CSF.

---
## Correções aplicadas (2026-07-02) — build-verificado; deploy live PENDENTE (limite diário Vercel free, reset 24h)
- **Cabeçalhos** (next.config.mjs `headers()` + `poweredByHeader:false`): CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS. Ficam live no próximo deploy.
- **App já muito seguro:** **0 findings de deps** (Next 16.2.6, última major); RLS 0 tabelas anônimas; webhook Stripe valida assinatura (400 sem assinatura); nenhum segredo rastreado no git (só `.env.local` gitignored); findings LOW de secret = anon/.env gitignored (mitigados).
- **CORS ACAO=\*** na origem: default de plataforma (não setado no repo); baixo risco sem Allow-Credentials.
