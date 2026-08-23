// E-mails transacionais (Resend ou Brevo). No-op silencioso sem chave — nunca quebra o webhook.
const FROM = process.env.EMAIL_FROM || 'ZapFunnel <no-reply@zapfunnel.app>'
const APP = 'ZapFunnel'

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!to) return
  try {
    const resend = process.env.RESEND_API_KEY
    if (resend) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resend}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to, subject, html }),
      })
      return
    }
    const brevo = process.env.BREVO_API_KEY
    if (brevo) {
      const m = FROM.match(/^(.*?)\s*<(.+)>$/)
      const sender = m ? { name: m[1], email: m[2] } : { email: FROM }
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevo, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }),
      })
    }
  } catch {
    /* no-op */
  }
}

const wrap = (title: string, body: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#e2e8f0;background:#0a0f0d">
    <h2 style="color:#22c55e;margin:0 0 16px">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #16241e;margin:24px 0">
    <p style="font-size:12px;color:#64748b">${APP} · Conexão protegida por SSL</p>
  </div>`

export const notifyWelcome = (to: string) =>
  send(to, `Bem-vindo(a) ao ${APP}!`, wrap('Sua assinatura está ativa 💬',
    `<p>Obrigado por assinar o ${APP}. Seu acesso já está liberado — conecte seu WhatsApp e monte seu funil de vendas.</p>`))

export const notifyCancellation = (to: string) =>
  send(to, `Sua assinatura ${APP} foi cancelada`, wrap('Assinatura cancelada',
    `<p>Confirmamos o cancelamento da sua assinatura. Você continua no plano inicial e pode reativar quando quiser.</p>`))

export const notifyDunning = (to: string) =>
  send(to, `Falha no pagamento — ${APP}`, wrap('Não conseguimos processar seu pagamento',
    `<p>Houve uma falha na cobrança da sua assinatura. Atualize seus dados de pagamento no painel para não perder o acesso.</p>`))
