"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login?next=/admin")
    else if (!isAdmin) router.replace("/dashboard")
  }, [loading, user, isAdmin, router])

  if (loading || !user || !isAdmin)
    return (
      <div className="grid h-dvh place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  return <>{children}</>
}
