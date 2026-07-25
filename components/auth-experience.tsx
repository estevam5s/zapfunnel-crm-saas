"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft, Check, X, ShieldCheck } from "lucide-react";

export type Testimonial = { avatarSrc: string; name: string; handle: string; text: string };

type Props = {
  mode: "login" | "register";
  appName: string;
  logoSrc: string;
  siteUrl?: string;
  loginUrl?: string;
  registerUrl?: string;
  heroImageSrc: string;
  heroTagline?: string;
  accent?: string;
  termsUrl?: string;
  privacyUrl?: string;
  testimonials?: Testimonial[];
  onLogin?: (email: string, password: string) => Promise<string | void>;
  onRegister?: (data: { name: string; email: string; password: string }) => Promise<string | void>;
  onGoogle?: () => void;
  onSwitchMode?: () => void;
  resetUrl?: string;
};

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const CSS = `
@keyframes ax-fade { from { opacity:0; filter:blur(6px); transform:translateY(14px) } to { opacity:1; filter:blur(0); transform:none } }
@keyframes ax-slide { from { opacity:0; filter:blur(8px); transform:translateX(30px) } to { opacity:1; filter:blur(0); transform:none } }
@keyframes ax-pop { from { opacity:0; transform:translateY(18px) scale(.96) } to { opacity:1; transform:none } }
.ax-el { opacity:0; animation: ax-fade .8s cubic-bezier(.2,.7,.2,1) forwards }
.ax-slide { opacity:0; animation: ax-slide .9s cubic-bezier(.2,.7,.2,1) forwards }
.ax-testi { opacity:0; animation: ax-pop .8s cubic-bezier(.2,.7,.2,1) forwards }
.ax-d1{animation-delay:.1s}.ax-d2{animation-delay:.2s}.ax-d3{animation-delay:.3s}.ax-d4{animation-delay:.4s}
.ax-d5{animation-delay:.5s}.ax-d6{animation-delay:.6s}.ax-d7{animation-delay:.7s}.ax-d8{animation-delay:.8s}.ax-d9{animation-delay:.9s}
.ax-d10{animation-delay:1s}.ax-d12{animation-delay:1.2s}.ax-d14{animation-delay:1.4s}
.ax-scroll::-webkit-scrollbar{width:8px}.ax-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px}
`;

const DEFAULT_TERMS: { title: string; body: string[] }[] = [
  { title: "1. Aceitação dos Termos", body: ["Ao criar uma conta e utilizar este serviço, você declara ter lido, compreendido e concordado integralmente com estes Termos de Serviço e com a Política de Privacidade. Caso não concorde, não prossiga com o cadastro."] },
  { title: "2. Cadastro e Conta", body: ["Você é responsável pela veracidade dos dados informados e pela guarda das suas credenciais de acesso. Notifique imediatamente qualquer uso não autorizado da sua conta. É proibido compartilhar credenciais ou criar contas com informações falsas."] },
  { title: "3. Uso Permitido", body: ["O serviço deve ser utilizado apenas para fins lícitos. É vedado: (a) violar leis ou direitos de terceiros; (b) tentar acessar áreas restritas ou dados de outros usuários; (c) realizar engenharia reversa, scraping abusivo ou sobrecarga da infraestrutura; (d) transmitir malware ou conteúdo ilegal."] },
  { title: "4. Planos, Pagamentos e Cancelamento", body: ["Alguns recursos exigem assinatura paga, cobrada de forma recorrente pelo provedor de pagamentos. Você pode cancelar a qualquer momento; o acesso permanece até o fim do período já pago, sem reembolso proporcional salvo exigência legal.", "Preços podem ser reajustados mediante aviso prévio razoável."] },
  { title: "5. Propriedade Intelectual", body: ["Todo o conteúdo, marca, código e design da plataforma pertencem ao titular do serviço. Os dados e conteúdos que você insere permanecem seus; você nos concede licença limitada para operá-los dentro do serviço."] },
  { title: "6. Proteção de Dados (LGPD)", body: ["Tratamos seus dados pessoais conforme a Lei 13.709/2018 (LGPD) e a nossa Política de Privacidade: coletamos o mínimo necessário, com bases legais adequadas, e adotamos medidas de segurança. Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.", "Utilizamos cookies essenciais para autenticação e, com seu consentimento, cookies de analytics."] },
  { title: "7. Disponibilidade e Limitação de Responsabilidade", body: ["O serviço é fornecido “no estado em que se encontra”. Empenhamo-nos na disponibilidade e segurança, mas não garantimos operação ininterrupta ou livre de erros. Na máxima extensão permitida por lei, não nos responsabilizamos por danos indiretos ou lucros cessantes."] },
  { title: "8. Rescisão", body: ["Podemos suspender ou encerrar contas que violem estes Termos. Você pode encerrar sua conta a qualquer momento pelas configurações da plataforma."] },
  { title: "9. Alterações e Contato", body: ["Estes Termos podem ser atualizados; mudanças relevantes serão comunicadas. O uso continuado após a atualização implica concordância. Dúvidas podem ser encaminhadas pelos canais de suporte da plataforma."] },
];

function TermsModal({ appName, accent, onClose, onAccept }: { appName: string; accent: string; onClose: () => void; onAccept: () => void }) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedEnd(true);
  };
  useEffect(() => { const el = ref.current; if (el && el.scrollHeight <= el.clientHeight + 24) setReachedEnd(true); }, []);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/12 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: accent }} />
            <h3 className="text-lg font-semibold text-white">Termos de Serviço e Privacidade — {appName}</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div ref={ref} onScroll={onScroll} className="ax-scroll flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-zinc-300">
          <p className="text-zinc-400">Leia o documento até o final para habilitar o aceite.</p>
          {DEFAULT_TERMS.map((s) => (
            <section key={s.title}>
              <h4 className="mb-1 font-semibold text-white">{s.title}</h4>
              {s.body.map((p, i) => <p key={i} className="mt-1">{p}</p>)}
            </section>
          ))}
          <p className="pt-2 text-center text-xs text-zinc-500">— Fim do documento —</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <span className="text-xs text-zinc-400">{reachedEnd ? "Você leu até o final." : "Role até o final para aceitar."}</span>
          <button disabled={!reachedEnd} onClick={onAccept}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: accent }}>
            <Check className="h-4 w-4" /> Li e aceito os termos
          </button>
        </div>
      </div>
    </div>
  );
}

const Field = ({ accent, label, children }: { accent: string; label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
    <div className="ax-input rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors" style={{ ["--ax" as any]: accent }}>
      {children}
    </div>
  </label>
);

export default function AuthExperience(props: Props) {
  const {
    mode, appName, logoSrc, siteUrl = "/", loginUrl = "/login", registerUrl = "/register",
    heroImageSrc, heroTagline, accent = "#7c5cff",
    testimonials = [], onLogin, onRegister, onGoogle, onSwitchMode, resetUrl = "/reset-password",
  } = props;
  const switchLink = (label: string) =>
    onSwitchMode ? (
      <button type="button" onClick={onSwitchMode} className="font-semibold hover:underline" style={{ color: accent }}>{label}</button>
    ) : (
      <a href={isReg ? loginUrl : registerUrl} className="font-semibold hover:underline" style={{ color: accent }}>{label}</a>
    );
  const isReg = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isReg) {
      if (!name.trim()) return setError("Informe seu nome completo.");
      if (email !== email2) return setError("Os e-mails não coincidem.");
      if (pass.length < 6) return setError("A senha deve ter ao menos 6 caracteres.");
      if (pass !== pass2) return setError("As senhas não coincidem.");
      if (!accepted) { setShowTerms(true); return; }
    }
    setLoading(true);
    try {
      const err = isReg
        ? await onRegister?.({ name: name.trim(), email, password: pass })
        : await onLogin?.(email, pass);
      if (err) setError(String(err));
    } catch (e: any) {
      setError(e?.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-transparent p-3.5 text-sm text-white placeholder-zinc-500 outline-none";

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-zinc-950 text-white md:flex-row" style={{ ["--ax" as any]: accent }}>
      <style dangerouslySetInnerHTML={{ __html: CSS + `.ax-input:focus-within{border-color:${accent}99;background:${accent}14}` }} />

      {/* LEFT — form */}
      <section className="relative flex flex-1 flex-col p-6 sm:p-10">
        {/* top bar: logo + back */}
        <div className="ax-el ax-d1 flex items-center justify-between">
          <a href={siteUrl} className="flex items-center gap-2.5">
            <img src={logoSrc} alt={appName} className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-base font-bold tracking-tight">{appName}</span>
          </a>
          <a href={siteUrl} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
          </a>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="ax-el ax-d2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {isReg ? "Crie sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="ax-el ax-d3 mt-2 text-zinc-400">
            {isReg ? `Comece a usar o ${appName} em segundos.` : `Acesse o painel do ${appName} e continue de onde parou.`}
          </p>

          {onGoogle && (
            <>
              <button onClick={onGoogle} type="button"
                className="ax-el ax-d3 mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium transition hover:bg-white/10">
                <GoogleIcon /> Continuar com Google
              </button>
              <div className="ax-el ax-d4 my-5 flex items-center gap-3 text-xs text-zinc-500">
                <span className="h-px flex-1 bg-white/10" /> ou com e-mail <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={onGoogle ? "space-y-4" : "mt-7 space-y-4"}>
            {isReg && (
              <div className="ax-el ax-d4">
                <Field accent={accent} label="Nome completo">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className={inputCls} autoComplete="name" />
                </Field>
              </div>
            )}
            <div className="ax-el ax-d5">
              <Field accent={accent} label={isReg ? "Seu melhor e-mail" : "E-mail"}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputCls} autoComplete="email" />
              </Field>
            </div>
            {isReg && (
              <div className="ax-el ax-d5">
                <Field accent={accent} label="Confirmar e-mail">
                  <input type="email" required value={email2} onChange={(e) => setEmail2(e.target.value)} placeholder="Repita o e-mail" className={inputCls} />
                </Field>
              </div>
            )}
            <div className="ax-el ax-d6">
              <Field accent={accent} label="Senha">
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className={inputCls + " pr-12"} autoComplete={isReg ? "new-password" : "current-password"} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white">
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>
            </div>
            {isReg && (
              <div className="ax-el ax-d6">
                <Field accent={accent} label="Confirmar senha">
                  <input type={showPass ? "text" : "password"} required value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repita a senha" className={inputCls} />
                </Field>
              </div>
            )}

            {isReg && (
              <label className="ax-el ax-d7 flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                <button type="button" onClick={() => (accepted ? setAccepted(false) : setShowTerms(true))}
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition"
                  style={{ borderColor: accepted ? accent : "rgba(255,255,255,.25)", background: accepted ? accent : "transparent" }}
                  aria-checked={accepted} role="checkbox">
                  {accepted && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
                <span onClick={(e) => e.preventDefault()}>
                  Ao continuar, você concorda com os{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="font-medium underline hover:opacity-80" style={{ color: accent }}>Termos de serviço</button>{" "}
                  e{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="font-medium underline hover:opacity-80" style={{ color: accent }}>Políticas de privacidade</button>.
                  {!accepted && <span className="mt-0.5 block text-xs text-zinc-500">Clique na caixa para ler e aceitar os termos.</span>}
                </span>
              </label>
            )}

            {!isReg && (
              <div className="ax-el ax-d7 flex items-center justify-end text-sm">
                <a href={resetUrl} className="hover:underline" style={{ color: accent }}>Esqueci a senha</a>
              </div>
            )}

            {error && <p className="ax-el rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">{error}</p>}

            <button disabled={loading} type="submit"
              className="ax-el ax-d8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: accent }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isReg ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="ax-el ax-d9 mt-6 text-center text-sm text-zinc-400">
            {isReg ? <>Já tem conta? {switchLink("Entrar")}</> : <>Novo por aqui? {switchLink("Criar conta grátis")}</>}
          </p>
        </div>
      </section>

      {/* RIGHT — hero + testimonials */}
      <section className="relative hidden flex-1 p-3 md:block">
        <div className="ax-slide ax-d3 absolute inset-3 overflow-hidden rounded-[28px] bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accent}22 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,.82) 100%)` }} />
          {heroTagline && (
            <div className="absolute left-8 top-8 right-8">
              <p className="max-w-md text-2xl font-semibold leading-snug text-white drop-shadow-lg">{heroTagline}</p>
            </div>
          )}
          {testimonials.length > 0 && (
            <div className="absolute bottom-6 left-1/2 flex w-full -translate-x-1/2 justify-center gap-4 px-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className={`ax-testi ${i === 0 ? "ax-d10" : i === 1 ? "ax-d12 hidden xl:flex" : "ax-d14 hidden 2xl:flex"} w-64 items-start gap-3 rounded-3xl border border-white/12 bg-black/40 p-4 backdrop-blur-xl`}>
                  <img src={t.avatarSrc} alt="" className="h-10 w-10 shrink-0 rounded-2xl object-cover" />
                  <div className="text-xs leading-snug">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-zinc-400">{t.handle}</p>
                    <p className="mt-1 text-zinc-200">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showTerms && (
        <TermsModal appName={appName} accent={accent} onClose={() => setShowTerms(false)} onAccept={() => { setAccepted(true); setShowTerms(false); }} />
      )}
    </div>
  );
}
