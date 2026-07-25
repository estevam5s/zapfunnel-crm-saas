"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { isAdminEmail, hasValidProof } from "@/lib/tfa"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login?next=/admin")
    else if (!isAdmin) router.replace("/dashboard")
    // 2FA Telegram (SecSaaS): admin precisa validar o código antes de abrir o painel
    else if (isAdminEmail(user.email) && !hasValidProof())
      router.replace(`/2fa?email=${encodeURIComponent(user.email || "")}&redirect=/admin`)
  }, [loading, user, isAdmin, router])

  const needs2fa = !!user && isAdminEmail(user.email) && !hasValidProof()
  if (loading || !user || !isAdmin || needs2fa)
    return (
      <div className="grid h-dvh place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  return <>{children}</>
}
