// 2FA via Telegram — gateway central SecSaaS (@SecSaaS_Bot). Camada aditiva, só afeta o admin.
// Portável: não depende de supabase nem de libs; só fetch + localStorage.
export const TFA_GATEWAY = process.env.NEXT_PUBLIC_TFA_GATEWAY || "https://secsaas-gateway.vercel.app";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SaaS";
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "contato@estevamsouza.com.br").toLowerCase();
export const PROOF_KEY = "tfa_proof";

export const isAdminEmail = (email?: string | null) => !!email && email.toLowerCase() === ADMIN_EMAIL;

export async function requestOtp(email: string) {
  try {
    const r = await fetch(`${TFA_GATEWAY}/api/request-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: APP_NAME, email }),
    });
    return await r.json();
  } catch { return { ok: false, error: "network" }; }
}

export async function verifyOtp(challenge: string, code: string) {
  try {
    const r = await fetch(`${TFA_GATEWAY}/api/verify-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge, code }),
    });
    return await r.json();
  } catch { return { ok: false, error: "network" }; }
}

export function saveProof(proof: string) { try { localStorage.setItem(PROOF_KEY, proof); } catch {} }

export function hasValidProof(): boolean {
  try {
    const t = localStorage.getItem(PROOF_KEY);
    if (!t) return false;
    const p = JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    return !!p.exp && Date.now() < p.exp;
  } catch { return false; }
}
