"use client";
/* eslint-disable @next/next/no-img-element */
// Widget de chat portátil (estilo Crisp/Intercom) — 100% inline-styled, sem Tailwind,
// funciona em Next / Vite / CRA. Dois modos: "Assistente IA" (respostas em markdown) e
// "Falar com a equipe" (admin — exige login). Botão flutuante no canto inferior direito.
//
// Backend (configurável por props):
//   aiEndpoint     POST { messages:[{role,content}] } -> { reply } | stream de texto
//   adminEndpoint  POST { text } -> { ok }            (envia msg p/ o admin; exige login)
//   adminThread    GET  -> { messages:[{from:'user'|'admin', text, at}] }  (opcional, histórico)
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type AdminMsg = { from: "user" | "admin"; text: string; at?: string };
type Props = {
  appName: string;
  accent?: string;
  logoSrc?: string;
  greeting?: string;
  subgreeting?: string;
  suggestions?: string[];
  aiEndpoint?: string;      // backend IA (default: gateway central da VPS)
  adminEndpoint?: string;   // envio de mensagem p/ a equipe
  isLoggedIn?: boolean;
  loginUrl?: string;
  userEmail?: string;       // e-mail do usuário logado (identifica no /support)
};

const AI_DEFAULT = "https://saas-chat.ucpvkj.easypanel.host/";
const SUPPORT_DEFAULT = "https://saas-chat.ucpvkj.easypanel.host/support";

// ---- markdown leve (negrito, código inline, blocos ```), preview profissional ----
function renderMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const segs = text.split(/(```[\s\S]*?```)/g);
  segs.forEach((seg, si) => {
    if (seg.startsWith("```")) {
      const m = seg.match(/^```(\w+)?\n?([\s\S]*?)```$/);
      parts.push(
        <pre key={si} style={{ margin: "6px 0", overflowX: "auto", borderRadius: 8, background: "#0d1117", color: "#e6edf3", padding: 10, fontSize: 12.5, lineHeight: 1.5 }}>
          <code style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{(m?.[2] || "").replace(/\n$/, "")}</code>
        </pre>,
      );
      return;
    }
    seg.split("\n").forEach((line, li) => {
      const key = `${si}-${li}`;
      const h = line.match(/^(#{1,3})\s+(.*)/);
      const bullet = line.match(/^\s*[-*]\s+(.*)/);
      if (line.trim() === "") { parts.push(<div key={key} style={{ height: 4 }} />); return; }
      const content = inlineMd((h ? h[2] : bullet ? bullet[1] : line), key);
      if (h) parts.push(<p key={key} style={{ margin: "4px 0", fontWeight: 700, fontSize: 14 }}>{content}</p>);
      else if (bullet) parts.push(<div key={key} style={{ display: "flex", gap: 6, margin: "2px 0" }}><span>•</span><span>{content}</span></div>);
      else parts.push(<p key={key} style={{ margin: "3px 0" }}>{content}</p>);
    });
  });
  return <div>{parts}</div>;
}
function inlineMd(text: string, kb: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={`${kb}-${i}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={`${kb}-${i}`} style={{ background: "rgba(0,0,0,.06)", borderRadius: 4, padding: "1px 5px", fontFamily: "ui-monospace, monospace", fontSize: "0.9em" }}>{t.slice(1, -1)}</code>);
    else { const mm = t.match(/\[([^\]]+)\]\(([^)]+)\)/); if (mm) out.push(<a key={`${kb}-${i}`} href={mm[2]} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{mm[1]}</a>); }
    last = m.index + t.length; i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function AiChatWidget({
  appName, accent = "#4f46e5", logoSrc,
  greeting = "Dúvidas? Fale com a gente.", subgreeting = "Nossa IA responde na hora — e a equipe também ajuda.",
  suggestions = ["Como funciona?", "Quais são os planos?", "Preciso de ajuda com minha conta"],
  aiEndpoint = AI_DEFAULT, adminEndpoint = SUPPORT_DEFAULT,
  isLoggedIn = false, loginUrl = "/login", userEmail = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ai" | "admin">("ai");
  const [aiMsgs, setAiMsgs] = useState<Msg[]>([]);
  const [adminMsgs, setAdminMsgs] = useState<AdminMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [aiMsgs, adminMsgs, busy, tab]);

  async function sendAI(text: string) {
    const next = [...aiMsgs, { role: "user" as const, content: text }];
    setAiMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch(aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, app: appName }) });
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const d = await res.json();
        setAiMsgs((m) => [...m, { role: "assistant", content: d.reply || d.error || "(sem resposta)" }]);
      } else {
        const reader = res.body?.getReader(); const dec = new TextDecoder(); let acc = "";
        setAiMsgs((m) => [...m, { role: "assistant", content: "" }]);
        while (reader) { const { value, done } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setAiMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; }); }
      }
    } catch { setAiMsgs((m) => [...m, { role: "assistant", content: "Não consegui responder agora. Tente novamente." }]); }
    finally { setBusy(false); }
  }
  async function sendAdmin(text: string) {
    setAdminMsgs((m) => [...m, { from: "user", text }]); setInput(""); setBusy(true);
    try {
      await fetch(adminEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, app: appName, email: userEmail }) });
      setAdminMsgs((m) => [...m, { from: "admin", text: "Recebemos sua mensagem! Nossa equipe responderá por aqui e pelo seu e-mail em breve." }]);
    } catch { setAdminMsgs((m) => [...m, { from: "admin", text: "Não consegui enviar agora. Tente novamente em instantes." }]); }
    finally { setBusy(false); }
  }
  function onSend() {
    const t = input.trim(); if (!t || busy) return;
    if (tab === "ai") sendAI(t); else if (isLoggedIn) sendAdmin(t);
  }

  const CSS = `
  @keyframes aicw-pop{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
  .aicw *{box-sizing:border-box}
  .aicw-scroll::-webkit-scrollbar{width:7px}.aicw-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:6px}
  .aicw-chip:hover{background:${accent}12;border-color:${accent}66}
  .aicw-send:hover{opacity:.9}`;

  return (
    <div className="aicw" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 2147483000, fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {open && (
        <div style={{ position: "absolute", bottom: 76, right: 0, width: 384, maxWidth: "calc(100vw - 40px)", height: 560, maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 20, background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,.24)", animation: "aicw-pop .22s ease", border: "1px solid rgba(0,0,0,.06)" }}>
          {/* header */}
          <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff", padding: "16px 18px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {logoSrc ? <img src={logoSrc} alt={appName} style={{ height: 32, width: 32, borderRadius: 9, objectFit: "contain", background: "#fff2" }} /> : <div style={{ height: 32, width: 32, borderRadius: 9, background: "#ffffff33", display: "grid", placeItems: "center", fontWeight: 800 }}>{appName[0]}</div>}
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{greeting}</div>
                <div style={{ fontSize: 12.5, opacity: 0.85 }}>{subgreeting}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {([["ai", "Assistente IA"], ["admin", "Falar com a equipe"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)} style={{ flex: 1, border: 0, cursor: "pointer", borderRadius: 9, padding: "7px 0", fontSize: 12.5, fontWeight: 600, background: tab === k ? "#fff" : "#ffffff22", color: tab === k ? accent : "#fff" }}>{label}</button>
              ))}
            </div>
          </div>

          {/* body */}
          <div ref={scrollRef} className="aicw-scroll" style={{ flex: 1, overflowY: "auto", padding: 16, background: "#f7f7f9" }}>
            {tab === "ai" ? (
              <>
                <Bubble side="in" accent={accent}>Olá! Sou o assistente do {appName}. Posso te ajudar com informações da plataforma. Como posso ajudar?</Bubble>
                {aiMsgs.map((m, i) => (
                  <Bubble key={i} side={m.role === "user" ? "out" : "in"} accent={accent}>
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                  </Bubble>
                ))}
                {busy && tab === "ai" && <Bubble side="in" accent={accent}><Typing /></Bubble>}
                {aiMsgs.length === 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    {suggestions.map((s) => (
                      <button key={s} className="aicw-chip" onClick={() => sendAI(s)} style={{ border: "1px solid rgba(0,0,0,.12)", background: "#fff", borderRadius: 999, padding: "8px 14px", fontSize: 13, cursor: "pointer", color: "#111" }}>{s}</button>
                    ))}
                  </div>
                )}
              </>
            ) : isLoggedIn ? (
              <>
                <Bubble side="in" accent={accent}>Você está falando com a equipe do {appName}. Deixe sua mensagem que respondemos por aqui.</Bubble>
                {adminMsgs.map((m, i) => <Bubble key={i} side={m.from === "user" ? "out" : "in"} accent={accent}>{m.text}</Bubble>)}
              </>
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", textAlign: "center", padding: 20 }}>
                <div>
                  <p style={{ fontWeight: 600, color: "#111" }}>Faça login para falar com a equipe</p>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Assim conseguimos identificar sua conta e responder com segurança.</p>
                  <a href={loginUrl} style={{ display: "inline-block", marginTop: 12, background: accent, color: "#fff", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>Entrar</a>
                </div>
              </div>
            )}
          </div>

          {/* compose */}
          {(tab === "ai" || isLoggedIn) && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,.08)", padding: 10, background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSend(); }} placeholder="Escreva sua mensagem…" style={{ flex: 1, border: "1px solid rgba(0,0,0,.12)", borderRadius: 12, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              <button className="aicw-send" onClick={onSend} disabled={busy} aria-label="Enviar" style={{ border: 0, cursor: "pointer", background: accent, color: "#fff", borderRadius: 12, width: 40, height: 40, display: "grid", placeItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          )}
          <div style={{ textAlign: "center", fontSize: 11, color: "#9aa0aa", padding: "6px 0 8px", background: "#fff" }}>Respostas por IA · {appName}</div>
        </div>
      )}

      {/* launcher */}
      <button onClick={() => setOpen(!open)} aria-label="Abrir chat" style={{ width: 60, height: 60, borderRadius: "50%", border: 0, cursor: "pointer", background: accent, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.28)", display: "grid", placeItems: "center", transition: "transform .15s" }}>
        {open
          ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>}
      </button>
    </div>
  );
}

function Bubble({ side, accent, children }: { side: "in" | "out"; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: side === "out" ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{ maxWidth: "82%", borderRadius: 16, padding: "9px 13px", fontSize: 14, lineHeight: 1.5, background: side === "out" ? accent : "#fff", color: side === "out" ? "#fff" : "#1a1a1a", border: side === "out" ? "none" : "1px solid rgba(0,0,0,.07)", borderBottomRightRadius: side === "out" ? 4 : 16, borderBottomLeftRadius: side === "in" ? 4 : 16 }}>
        {children}
      </div>
    </div>
  );
}
function Typing() {
  return <span style={{ display: "inline-flex", gap: 3 }}>
    {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#bbb", display: "inline-block", animation: `aicw-pop .6s ${i * 0.15}s infinite alternate` }} />)}
  </span>;
}
