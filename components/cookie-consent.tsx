"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const KEY = "shiftnfe-cookie-consent";
export function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem(KEY)) setShow(true); } catch {} }, []);
  const decide = (v: string) => { try { localStorage.setItem(KEY, v); } catch {} setShow(false); };
  if (!show) return null;
  return (<div className="fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4"><div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/95 p-4 text-neutral-100 shadow-xl backdrop-blur sm:flex-row sm:items-center"><div className="flex-1 text-sm text-neutral-300"><p className="font-medium text-white">Nós respeitamos a sua privacidade</p><p className="mt-0.5">Usamos cookies para melhorar sua experiência, em conformidade com a LGPD. Veja a <Link href="/privacidade" className="font-medium text-green-300 hover:underline">Política de Privacidade</Link> e a <Link href="/cookies" className="font-medium text-green-300 hover:underline">Política de Cookies</Link>.</p></div><div className="flex shrink-0 gap-2"><button onClick={() => decide("essential")} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10">Só essenciais</button><button onClick={() => decide("accepted")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Aceitar</button></div></div></div>);
}
