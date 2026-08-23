"use client";

// Widget de suporte estilo chat.html (visual do Chatwoot: abas Mensagens/Artigos/
// Buscar, header, respostas rápidas, input emoji/anexo/áudio, rodapé "Desenvolvido
// por Chatwoot"). Azul #1f93ff. Conectado AO CHATWOOT via ponte server-side
// /api/support (inbox tipo API) — mensagens caem no painel, respostas do agente
// voltam por polling. Mantém o nome ChatwootLoader p/ não mexer nos imports.

import { useCallback, useEffect, useRef, useState } from "react";

const ACCENT = "#1f93ff";
const ACCENT_SOFT = "#f0f7ff";
const BRAND = process.env.NEXT_PUBLIC_SUPPORT_BRAND || "nossa equipe";
const GREETING = `Olá! 👋 Como podemos ajudar?`;
const STORAGE_CONV = "support-cw-conv";
const REQ_TIMEOUT = 20000;
const POLL_MS = 4000;

type Msg = { id?: string; role: string; content: string };
type Tab = "mensagens" | "artigos" | "buscar";

const QUICK = [
  `Como o ${BRAND} funciona?`,
  "Quais são os planos e preços?",
  "Preciso de ajuda com minha conta",
  "Falar com um atendente",
];

const FAQ = [
  { t: "Como começar", d: "Passo a passo para criar sua conta e dar os primeiros passos.", q: "Como eu começo a usar?" },
  { t: "Planos e preços", d: "Entenda os planos disponíveis e o que cada um libera.", q: "Quais são os planos e preços?" },
  { t: "Minha conta", d: "Dúvidas sobre login, assinatura e configurações.", q: "Preciso de ajuda com minha conta." },
  { t: "Pagamentos e reembolso", d: "Formas de pagamento, notas e política de reembolso.", q: "Como funcionam os pagamentos e o reembolso?" },
  { t: "Suporte técnico", d: "Algo não está funcionando? Fale com a gente.", q: "Estou com um problema técnico." },
  { t: "Falar com um atendente", d: "Prefere falar com uma pessoa? É só escrever aqui.", q: "Quero falar com um atendente." },
];

const SCOPED_CSS = `
#support-chat, #support-chat *, #support-chat-launcher { cursor: auto !important; }
#support-chat button, #support-chat a, #support-chat-launcher { cursor: pointer !important; }
#support-chat input, #support-chat textarea { cursor: text !important; }
@keyframes scBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-4px);opacity:1} }
.sc-dot { width:7px;height:7px;border-radius:50%;background:#9ca3af;display:inline-block;animation:scBounce 1.2s infinite ease-in-out; }
`;

const IChat = (p: { size?: number; color?: string }) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke={p.color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);
const IHome = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>);
const IEmoji = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>);
const IClip = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>);
const IMic = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>);
const ISend = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const ISearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const IClose = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const EMOJIS = ["😀", "😄", "🙌", "🔥", "✅", "🚀", "💡", "🙏", "👍", "🎯", "😅", "🤝"];

async function fetchT(url: string, opts: RequestInit = {}, ms = REQ_TIMEOUT) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ac.signal }); }
  finally { clearTimeout(id); }
}

export default function ChatwootLoader() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("mensagens");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [query, setQuery] = useState("");
  const convId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const started = messages.length > 0;

  useEffect(() => { try { convId.current = localStorage.getItem(STORAGE_CONV); } catch { /* */ } }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const poll = useCallback(async () => {
    if (!convId.current) return;
    try {
      const r = await fetchT(`/api/support?conversationId=${convId.current}`, { cache: "no-store" }, 15000);
      const d = await r.json();
      if (Array.isArray(d.messages)) setMessages(d.messages);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (!open) return;
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [open, poll]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput(""); setShowEmoji(false); setTab("mensagens");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const r = await fetchT("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationId: convId.current }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.conversationId) {
        convId.current = String(d.conversationId);
        try { localStorage.setItem(STORAGE_CONV, convId.current); } catch { /* */ }
      }
      if (Array.isArray(d.messages) && d.messages.length) setMessages(d.messages);
      else if (!d.conversationId) throw new Error(d.error || "falha");
    } catch {
      setMessages((m) => [...m, { role: "agent", content: "Não consegui enviar agora. Tente de novo em instantes. 🙏" }]);
    } finally { setLoading(false); }
  }

  const filtered = query.trim() ? FAQ.filter((a) => (a.t + " " + a.d).toLowerCase().includes(query.toLowerCase())) : FAQ;

  const S = {
    launcher: { position: "fixed", right: 24, bottom: 24, width: 60, height: 60, borderRadius: "50%", background: ACCENT, color: "#fff", border: "none", zIndex: 2147483000, boxShadow: "0 8px 24px rgba(31,147,255,.45)", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
    panel: { position: "fixed", right: 24, bottom: 24, width: "min(400px, calc(100vw - 32px))", height: "min(700px, calc(100vh - 48px))", background: "#fff", borderRadius: 16, zIndex: 2147483000, boxShadow: "0 12px 40px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif', color: "#111827" } as React.CSSProperties,
    topnav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" } as React.CSSProperties,
    navBtn: { background: "none", border: "none", color: "#1f2937", display: "flex", alignItems: "center" } as React.CSSProperties,
    tabs: { display: "flex", background: "#f3f4f6", borderRadius: 30, padding: 4, flex: 1, margin: "0 10px", gap: 4 } as React.CSSProperties,
    tab: (on: boolean) => ({ flex: 1, textAlign: "center", padding: "8px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: on ? ACCENT : "transparent", color: on ? "#fff" : "#374151", boxShadow: on ? "0 2px 4px rgba(0,0,0,.1)" : "none" }) as React.CSSProperties,
    header: { display: "flex", alignItems: "center", padding: "8px 20px 18px", gap: 14, borderBottom: "1px solid #f3f4f6" } as React.CSSProperties,
    avatar: { width: 52, height: 52, background: ACCENT, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 } as React.CSSProperties,
    body: { flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" } as React.CSSProperties,
    bubbleBot: { background: "#f3f4f6", color: "#1f2937", padding: "12px 16px", borderRadius: 16, fontSize: 15, lineHeight: 1.5, maxWidth: "85%", alignSelf: "flex-start", marginBottom: 14, whiteSpace: "pre-wrap" } as React.CSSProperties,
    bubbleUser: { background: ACCENT, color: "#fff", padding: "12px 16px", borderRadius: 16, fontSize: 15, lineHeight: 1.5, maxWidth: "85%", alignSelf: "flex-end", marginBottom: 14, whiteSpace: "pre-wrap" } as React.CSSProperties,
    qrWrap: { display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", marginTop: "auto" } as React.CSSProperties,
    qr: { padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: 20, background: "#fff", color: "#111827", fontSize: 14, transition: "all .2s" } as React.CSSProperties,
    inputWrap: { padding: "14px 16px", background: "#fff" } as React.CSSProperties,
    inputBox: { border: `2px solid ${ACCENT}`, borderRadius: 16, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 } as React.CSSProperties,
    input: { border: "none", outline: "none", fontSize: 15, width: "100%", color: "#1f2937", background: "transparent" } as React.CSSProperties,
    toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
    iconBtn: { background: "none", border: "none", color: "#6b7280", display: "flex", padding: 2 } as React.CSSProperties,
    footer: { textAlign: "center", padding: "0 0 14px", fontSize: 13, color: "#9ca3af", background: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 } as React.CSSProperties,
    art: { textAlign: "left", width: "100%", display: "block", padding: "14px 14px", border: "1px solid #eef0f3", borderRadius: 12, marginBottom: 10, background: "#fff", color: "#111827" } as React.CSSProperties,
  };

  if (!open) {
    return (
      <>
        <style>{SCOPED_CSS}</style>
        <button id="support-chat-launcher" aria-label="Abrir chat de suporte" style={S.launcher} onClick={() => setOpen(true)}>
          <IChat size={26} color="#fff" />
        </button>
      </>
    );
  }

  return (
    <div id="support-chat" style={S.panel} role="dialog" aria-label="Suporte">
      <style>{SCOPED_CSS}</style>
      <div style={S.topnav}>
        <button style={S.navBtn} title="Início" onClick={() => setTab("mensagens")}><IHome /></button>
        <div style={S.tabs}>
          <button style={S.tab(tab === "mensagens")} onClick={() => setTab("mensagens")}>
            <IChat size={16} color={tab === "mensagens" ? "#fff" : "#374151"} /> Mensagens
          </button>
          <button style={S.tab(tab === "artigos")} onClick={() => setTab("artigos")}>Artigos</button>
          <button style={S.tab(tab === "buscar")} onClick={() => setTab("buscar")}>Buscar</button>
        </div>
        <button style={S.navBtn} title="Fechar" onClick={() => setOpen(false)}><IClose /></button>
      </div>

      <div style={S.header}>
        <div style={S.avatar}><IChat size={28} color="#fff" /></div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Dúvidas? Fale conosco.</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Nossa equipe também pode ajudar</p>
        </div>
      </div>

      {tab === "mensagens" && (
        <>
          <div style={S.body} ref={scrollRef}>
            <div style={S.bubbleBot}>{GREETING}</div>
            {messages.map((m, i) => (
              <div key={m.id ?? `o${i}`} style={m.role === "user" ? S.bubbleUser : S.bubbleBot}>{m.content}</div>
            ))}
            {loading && (
              <div style={{ ...S.bubbleBot, display: "flex", gap: 5, alignItems: "center", padding: "14px 16px" }}>
                <span className="sc-dot" style={{ animationDelay: "0s" }} />
                <span className="sc-dot" style={{ animationDelay: ".2s" }} />
                <span className="sc-dot" style={{ animationDelay: ".4s" }} />
              </div>
            )}
            {started && !loading && (
              <div style={{ fontSize: 12, color: "#9ca3af", alignSelf: "flex-start", marginTop: -6, marginBottom: 8 }}>
                Nossa equipe responde por aqui — pode deixar sua mensagem. 💬
              </div>
            )}
            {!started && !loading && (
              <div style={S.qrWrap}>
                {QUICK.map((q) => (
                  <div key={q} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button style={S.qr}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = ACCENT_SOFT; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#fff"; }}
                      onClick={() => send(q)}>{q}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={S.inputWrap}>
            {showEmoji && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 4px 12px" }}>
                {EMOJIS.map((e) => (<button key={e} style={{ ...S.iconBtn, fontSize: 22 }} onClick={() => { setInput((v) => v + e); inputRef.current?.focus(); }}>{e}</button>))}
              </div>
            )}
            <div style={S.inputBox}>
              <input ref={inputRef} style={S.input} value={input} placeholder="Escreva sua mensagem..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
              <div style={S.toolbar}>
                <div style={{ display: "flex", gap: 16 }}>
                  <button style={{ ...S.iconBtn, color: showEmoji ? ACCENT : "#6b7280" }} title="Emoji" onClick={() => setShowEmoji((v) => !v)}><IEmoji /></button>
                  <button style={{ ...S.iconBtn, opacity: .5 }} title="Anexar (em breve)" disabled><IClip /></button>
                  <button style={{ ...S.iconBtn, opacity: .5 }} title="Áudio (em breve)" disabled><IMic /></button>
                </div>
                <button style={{ ...S.iconBtn, color: input.trim() && !loading ? ACCENT : "#9ca3af" }} title="Enviar" onClick={() => send(input)} disabled={loading}><ISend /></button>
              </div>
            </div>
          </div>
          <div style={S.footer}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="4"><circle cx="12" cy="12" r="8" /></svg>
            Desenvolvido por Chatwoot
          </div>
        </>
      )}

      {tab === "artigos" && (
        <div style={{ ...S.body, paddingTop: 8 }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 4px 14px" }}>Perguntas frequentes — toque para perguntar à equipe.</p>
          {FAQ.map((a) => (
            <button key={a.t} style={S.art} onClick={() => send(a.q)}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{a.t}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{a.d}</div>
            </button>
          ))}
        </div>
      )}

      {tab === "buscar" && (
        <div style={{ ...S.body, paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
            <ISearch />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar dúvidas..." style={{ ...S.input, fontSize: 14 }} />
          </div>
          {filtered.length === 0 && <p style={{ fontSize: 14, color: "#6b7280", padding: 4 }}>Nada encontrado. Fale com a gente na aba Mensagens.</p>}
          {filtered.map((a) => (
            <button key={a.t} style={S.art} onClick={() => send(a.q)}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{a.t}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{a.d}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
