"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquarePlus, X, Send, CheckCircle2, Loader2 } from "lucide-react";

const TYPES = [
  { v: "sugestao", label: "Sugestão" }, { v: "elogio", label: "Elogio" },
  { v: "critica", label: "Crítica" }, { v: "bug", label: "Problema" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("sugestao");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    setMounted(true);
    let dismissed = false;
    try { dismissed = !!localStorage.getItem("feedback-dismissed"); } catch {}
    if (dismissed) return;
    const t = setTimeout(() => { setShow(true); setTimeout(() => setEnter(true), 60); }, 4000);
    return () => clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, name, email, page: typeof window !== "undefined" ? window.location.pathname : "" }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) { setMessage(""); setName(""); setEmail(""); try { localStorage.setItem("feedback-dismissed", "1"); } catch {} setTimeout(() => { setOpen(false); setState("idle"); setEnter(false); setTimeout(() => setShow(false), 250); }, 1800); }
    } catch { setState("error"); }
  }

  if (!mounted || !show) return null;

  return createPortal(
    <>
      <button onClick={() => setOpen(true)} aria-label="Enviar feedback"
        style={{ opacity: enter ? 1 : 0, transform: enter ? "translateY(0)" : "translateY(12px)", transition: "opacity .35s ease, transform .35s ease", zIndex: 2147483000 }}
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-transform hover:scale-105 active:scale-95">
        <MessageSquarePlus className="h-4 w-4" /> Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => state !== "sending" && setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Envie seu feedback</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Sugestões, críticas ou elogios — queremos ouvir você.</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            {state === "done" ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="font-semibold">Obrigado pelo seu feedback!</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button type="button" key={t.v} onClick={() => setType(t.v)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${type === t.v ? "bg-green-600 text-white" : "border text-muted-foreground hover:bg-muted"}`}>{t.label}</button>
                  ))}
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} placeholder="Escreva sua mensagem..."
                  className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-green-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (opcional)" className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-green-500" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail (opcional)" className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-green-500" />
                </div>
                {state === "error" && <p className="text-sm text-red-500">Não foi possível enviar. Tente novamente.</p>}
                <button type="submit" disabled={state === "sending" || message.trim().length < 3}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60">
                  {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
