import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/redefinir")({
  head: () => ({ meta: [{ title: "Recuperar acesso — Escola Jossyquina" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await requireSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/admin/redefinir" });
    } finally { setSent(true); setBusy(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-10"><div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-2xl">
    <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Jossyquina</p><h1 className="mt-2 text-2xl font-bold text-primary">Recuperar acesso</h1>
    <p className="mt-2 text-sm text-muted-foreground">Introduza o e-mail administrativo. A resposta é genérica para proteger a existência das contas.</p>
    {!isSupabaseConfigured && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">Supabase não configurado neste ambiente.</p>}
    {sent ? <div className="mt-6 rounded-lg bg-muted p-4 text-sm">Se o endereço estiver associado a uma conta, receberá instruções para redefinir a palavra-passe.</div> : <form onSubmit={submit} className="mt-6 space-y-4"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="E-mail institucional" className="w-full rounded-lg border px-3 py-3" /><button disabled={busy || !isSupabaseConfigured} className="w-full rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black disabled:opacity-50">{busy ? "A enviar…" : "Enviar instruções"}</button></form>}
    <Link to="/admin/login" className="mt-6 block text-center text-sm font-semibold underline decoration-yellow-400 underline-offset-4">Voltar ao acesso</Link>
  </div></div>;
}
