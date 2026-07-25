"use client";

import { useState } from "react";
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
      if (res.ok) { setMessage(""); setName(""); setEmail(""); setTimeout(() => { setOpen(false); setState("idle"); }, 1800); }
    } catch { setState("error"); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Enviar feedback"
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
    </>
  );
}
