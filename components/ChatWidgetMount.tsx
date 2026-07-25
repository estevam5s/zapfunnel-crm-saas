"use client";
// Monta o AiChatWidget detectando o login automaticamente pela sessão Supabase
// guardada no localStorage (chave `sb-<ref>-auth-token`) — portátil, sem depender
// do client de auth de cada app. Se não houver sessão, a aba "Falar com a equipe"
// mostra o convite para entrar.
import { useEffect, useState } from "react";
import AiChatWidget from "./AiChatWidget";

type MountProps = {
  appName: string;
  accent?: string;
  logoSrc?: string;
  greeting?: string;
  subgreeting?: string;
  suggestions?: string[];
  loginUrl?: string;
};

export default function ChatWidgetMount(props: MountProps) {
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; email: string }>({ isLoggedIn: false, email: "" });
  useEffect(() => {
    try {
      for (const k of Object.keys(localStorage)) {
        if (/^sb-.*-auth-token$/.test(k)) {
          const v = JSON.parse(localStorage.getItem(k) || "{}");
          const email = v?.user?.email || v?.currentSession?.user?.email || v?.[0]?.email;
          if (email) { setAuth({ isLoggedIn: true, email }); break; }
        }
      }
    } catch { /* ignore */ }
  }, []);
  return <AiChatWidget {...props} isLoggedIn={auth.isLoggedIn} userEmail={auth.email} />;
}
