import type { Metadata } from "next"
import { AnimatedLogin } from "@/components/login/animated-login"

export const metadata: Metadata = {
  title: "Entrar — ZapFunnel",
  description: "Acesse seu painel de vendas do ZapFunnel.",
}

export default function LoginPage() {
  return <AnimatedLogin />
}
