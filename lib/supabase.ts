import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export function createAdminClient() {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
}
