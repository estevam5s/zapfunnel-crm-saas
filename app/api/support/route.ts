import { NextResponse } from "next/server";

// Ponte entre o widget de suporte (UI estilo chat.html) e o Chatwoot self-hosted.
// A API pública/widget do Chatwoot está indisponível nesse proxy, e a inbox
// WebWidget recusa mensagens "incoming" via API — então usamos uma inbox do
// tipo API (Channel::Api) + a Application API server-side. O token do Chatwoot
// fica só no servidor (env), nunca no bundle.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CW_URL = process.env.CHATWOOT_URL || "";
const CW_TOKEN = process.env.CHATWOOT_TOKEN || "";
const CW_ACCOUNT = process.env.CHATWOOT_ACCOUNT_ID || "1";
const CW_INBOX = process.env.CHATWOOT_INBOX_ID || "";

function cwHeaders() {
  return { "Content-Type": "application/json", api_access_token: CW_TOKEN };
}
function base() {
  return `${CW_URL}/api/v1/accounts/${CW_ACCOUNT}`;
}
function configured() {
  return Boolean(CW_URL && CW_TOKEN && CW_INBOX);
}

type CwMsg = { id: number; content: string | null; message_type: number; private?: boolean; content_type?: string };

// mapeia as mensagens do Chatwoot para o formato do widget (só incoming/outgoing visíveis)
function mapMessages(list: CwMsg[]) {
  return (list || [])
    .filter((m) => (m.message_type === 0 || m.message_type === 1) && !m.private && (m.content ?? "").trim())
    .map((m) => ({ id: String(m.id), role: m.message_type === 1 ? "agent" : "user", content: m.content as string }));
}

export async function POST(req: Request) {
  if (!configured()) {
    return NextResponse.json({ error: "Suporte indisponível no momento." }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message ?? "").trim().slice(0, 4000);
    const name = String(body?.name ?? "").slice(0, 80) || "Visitante do site";
    const email = String(body?.email ?? "").slice(0, 120) || null;
    let conversationId: number | null = Number(body?.conversationId) || null;

    if (!message) return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });

    // cria contato + conversa na primeira mensagem
    if (!conversationId) {
      const cRes = await fetch(`${base()}/contacts`, {
        method: "POST",
        headers: cwHeaders(),
        body: JSON.stringify({ inbox_id: Number(CW_INBOX), name, email }),
      });
      const cJson = await cRes.json().catch(() => ({}));
      const contact = cJson?.payload?.contact ?? cJson?.payload ?? cJson;
      const contactId = contact?.id;
      const sourceId = (contact?.contact_inboxes ?? [])[0]?.source_id;
      if (!contactId || !sourceId) {
        return NextResponse.json({ error: "Falha ao iniciar a conversa." }, { status: 502 });
      }
      const convRes = await fetch(`${base()}/conversations`, {
        method: "POST",
        headers: cwHeaders(),
        body: JSON.stringify({ source_id: sourceId, inbox_id: Number(CW_INBOX), contact_id: contactId }),
      });
      const convJson = await convRes.json().catch(() => ({}));
      conversationId = convJson?.id;
      if (!conversationId) return NextResponse.json({ error: "Falha ao criar a conversa." }, { status: 502 });
    }

    // posta a mensagem do visitante (incoming) → aparece no painel do Chatwoot
    await fetch(`${base()}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: cwHeaders(),
      body: JSON.stringify({ content: message, message_type: "incoming" }),
    });

    // retorna o histórico já atualizado
    const mRes = await fetch(`${base()}/conversations/${conversationId}/messages`, { headers: cwHeaders(), cache: "no-store" });
    const mJson = await mRes.json().catch(() => ({}));
    const messages = mapMessages(mJson?.payload ?? mJson ?? []);
    return NextResponse.json({ conversationId, messages });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro no suporte.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET: polling das respostas do agente
export async function GET(req: Request) {
  if (!configured()) return NextResponse.json({ messages: [], configured: false });
  try {
    const conversationId = new URL(req.url).searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ messages: [] });
    const mRes = await fetch(`${base()}/conversations/${conversationId}/messages`, { headers: cwHeaders(), cache: "no-store" });
    const mJson = await mRes.json().catch(() => ({}));
    return NextResponse.json({ conversationId: Number(conversationId), messages: mapMessages(mJson?.payload ?? mJson ?? []) });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
