import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acesso administrativo — Escola Jossyquina" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"password" | "mfa" | "enroll">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function passwordLogin(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = requireSupabase();
      const signed = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signed.error) throw signed.error;
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error) throw aal.error;
      if (aal.data.currentLevel === "aal2") return navigate({ to: "/admin", replace: true });
      if (aal.data.nextLevel === "aal2") {
        const factors = await supabase.auth.mfa.listFactors();
        if (factors.error) throw factors.error;
        const factor = factors.data.totp.find((f) => f.status === "verified");
        if (!factor) throw new Error("MFA factor unavailable");
        setFactorId(factor.id); setStep("mfa"); return;
      }
      const enrolled = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Jossyquina Admin" });
      if (enrolled.error) throw enrolled.error;
      setFactorId(enrolled.data.id); setQr(enrolled.data.totp.qr_code); setSecret(enrolled.data.totp.secret); setStep("enroll");
    } catch {
      setError("Não foi possível iniciar a sessão. Verifique as credenciais e tente novamente.");
    } finally { setBusy(false); }
  }

  async function verify(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = requireSupabase();
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
      if (result.error) throw result.error;

      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.error || !sessionResult.data.session?.user?.id) {
        throw sessionResult.error ?? new Error("A sessão não ficou disponível após a verificação MFA.");
      }

      await navigate({ to: "/admin", replace: true });
    } catch {
      setError(step === "enroll" ? "Não foi possível ativar o MFA. Confirme o código." : "Código de autenticação inválido.");
    } finally { setBusy(false); }
  }

  async function cancel() {
    await requireSupabase().auth.signOut();
    setStep("password"); setCode(""); setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-background p-7 shadow-2xl md:p-9">
        <div className="mb-7 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black"><ShieldCheck className="h-6 w-6" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-600">Jossyquina</p><h1 className="text-xl font-bold text-primary">Painel Administrativo</h1></div></div>
        {!isSupabaseConfigured && <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</div>}
        {error && <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {step === "password" && <form onSubmit={passwordLogin} className="space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required placeholder="E-mail institucional" className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2 focus:ring-yellow-400" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="Palavra-passe" className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2 focus:ring-yellow-400" />
          <button disabled={busy || !isSupabaseConfigured} className="w-full rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black disabled:opacity-50">{busy ? "A entrar…" : "Entrar no painel"}</button>
          <Link to="/admin/redefinir" className="block text-center text-sm font-semibold underline decoration-yellow-400 underline-offset-4">Esqueci a palavra-passe</Link>
        </form>}
        {(step === "mfa" || step === "enroll") && <form onSubmit={verify} className="space-y-4">
          <h2 className="text-lg font-bold text-primary">{step === "enroll" ? "Configure o MFA" : "Verificação em duas etapas"}</h2>
          <p className="text-sm text-muted-foreground">{step === "enroll" ? "Digitalize o QR Code com um autenticador TOTP e depois introduza o código." : "Introduza o código de 6 dígitos do seu autenticador."}</p>
          {step === "enroll" && qr && <img src={qr} alt="QR Code para configurar MFA" className="mx-auto h-56 w-56 rounded-lg border bg-white p-2" />}
          {step === "enroll" && <div className="rounded-lg bg-muted p-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Chave manual</p><p className="mt-1 break-all font-mono text-sm">{secret}</p></div>}
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required placeholder="Código de 6 dígitos" className="w-full rounded-lg border px-3 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-yellow-400" />
          <button disabled={busy || code.length !== 6} className="w-full rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black disabled:opacity-50">{busy ? "A verificar…" : step === "enroll" ? "Ativar MFA e entrar" : "Verificar código"}</button>
          <button type="button" onClick={cancel} className="w-full rounded-lg border px-4 py-3 text-sm font-semibold">Cancelar</button>
        </form>}
      </div>
    </div>
  );
}
