"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import AuthExperience from "@/components/auth-experience"

export const dynamic = "force-dynamic"

const HERO = "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1400&q=80" // WhatsApp/vendas
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

export default function LoginPage() {
  return <Suspense fallback={null}><Inner /></Suspense>
}

function Inner() {
  const router = useRouter()
  const params = useSearchParams()
  const { signIn, signInWithGoogle, signUp } = useAuth()
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "signup" ? "register" : "login")
  useEffect(() => { if (params.get("mode") === "signup") setMode("register") }, [params])

  async function onLogin(email: string, password: string) {
    const { error } = await signIn(email, password)
    if (error) return error.message?.includes("Invalid login") ? "E-mail ou senha incorretos." : (error.message || "Não foi possível autenticar.")
    const isAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase())
    router.push(isAdmin ? "/admin" : "/dashboard")
  }
  async function onRegister({ name, email, password }: { name: string; email: string; password: string }) {
    const { error } = await signUp(email, password, name || email.split("@")[0])
    if (error) return error.message || "Não foi possível criar a conta."
    router.push("/dashboard")
  }
  async function onGoogle() { await signInWithGoogle() }

  return (
    <AuthExperience
      mode={mode}
      appName="ZapFunnel"
      logoSrc="/brand-logo.png"
      siteUrl="/"
      heroImageSrc={HERO}
      heroTagline="Seu funil de vendas no WhatsApp, com IA e automações."
      accent="#16a34a"
      onLogin={onLogin}
      onRegister={onRegister}
      onGoogle={onGoogle}
      onSwitchMode={() => setMode((m) => (m === "login" ? "register" : "login"))}
    />
  )
}
