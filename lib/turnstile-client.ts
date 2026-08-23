export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export function loadTurnstile(): void {
  if (typeof document === "undefined" || !TURNSTILE_SITE_KEY) return;
  if (document.getElementById("cf-turnstile-script")) return;
  const s = document.createElement("script"); s.id = "cf-turnstile-script";
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; s.async = true; s.defer = true;
  document.head.appendChild(s);
}
export async function ensureHuman(): Promise<{ ok: boolean; reason?: string }> {
  if (!TURNSTILE_SITE_KEY) return { ok: true };
  const w = window as unknown as { turnstile?: { getResponse: () => string; reset: () => void } };
  const token = w.turnstile?.getResponse?.();
  if (!token) return { ok: false, reason: "Confirme que você não é um robô." };
  const ok = await fetch("/api/auth/turnstile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then((r) => r.ok).catch(() => false);
  try { w.turnstile?.reset?.(); } catch { /* noop */ }
  return ok ? { ok: true } : { ok: false, reason: "Verificação anti-robô falhou. Recarregue a página e tente novamente." };
}
