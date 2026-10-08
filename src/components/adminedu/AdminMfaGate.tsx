import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";

type Props = { onReady: () => void };

export function AdminMfaGate({ onReady }: Props) {
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"loading" | "enroll" | "challenge">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = requireSupabase();
      const { data, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (aalError) { setError("Não foi possível validar a autenticação multifator."); return; }
      if (data.currentLevel === "aal2") { onReady(); return; }

      const factors = await supabase.auth.mfa.listFactors();
      if (!active) return;
      const verified = factors.data?.totp?.find((factor) => factor.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("challenge");
      } else {
        const enrolled = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "AdminEdu",
        });
        if (!active) return;
        if (enrolled.error || !enrolled.data) {
          setError("Não foi possível iniciar a configuração do segundo fator.");
          return;
        }
        setFactorId(enrolled.data.id);
        setQrCode(enrolled.data.totp.qr_code);
        setSecret(enrolled.data.totp.secret);
        setMode("enroll");
      }
    })();
    return () => { active = false; };
  }, [onReady]);

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError("Introduza o código de 6 dígitos do autenticador.");
      return;
    }
    setError("");
    const supabase = requireSupabase();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) { setError("Não foi possível iniciar a verificação."); return; }
    const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
    if (result.error) { setError("Código inválido. Tente novamente."); return; }
    await supabase.auth.refreshSession();
    onReady();
  }

  if (mode === "loading") return <GateShell text="A validar o segundo fator..." />;
  return (
    <GateShell text={mode === "enroll" ? "Configure o segundo fator para entrar no AdminEdu." : "Confirme o código do seu autenticador."}>
      {mode === "enroll" && qrCode && (
        <div className="mb-5">
          <img src={qrCode} alt="QR code para configurar o autenticador" className="mx-auto h-52 w-52 rounded-lg border p-2" />
          <p className="mt-3 break-all text-xs text-slate-500">Chave manual: {secret}</p>
        </div>
      )}
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="w-full rounded-md border px-3 py-2 text-center text-lg tracking-[0.35em]"
        aria-label="Código MFA"
      />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button onClick={() => void verify()} className="mt-4 w-full rounded-md bg-slate-950 px-4 py-2.5 font-semibold text-white">
        Verificar e continuar
      </button>
    </GateShell>
  );
}

function GateShell({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-xl border bg-white p-7 text-center shadow-sm">
        <ShieldCheck className="mx-auto mb-4 text-amber-600" />
        <h1 className="font-semibold">AdminEdu — verificação adicional</h1>
        <p className="mt-2 text-sm text-slate-600">{text}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
