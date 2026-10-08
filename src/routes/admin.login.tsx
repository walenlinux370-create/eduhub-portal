import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    requireSupabase().auth.getUser().then(({ data }) => {
      if (data.user && (data.user.app_metadata?.role === "admin" || data.user.app_metadata?.admin === true)) {
        void navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("Não foi possível autenticar. Verifique as credenciais e o acesso administrativo.");
      setBusy(false);
      return;
    }

    if (!data.user || (data.user.app_metadata?.role !== "admin" && data.user.app_metadata?.admin !== true)) {
      await requireSupabase().auth.signOut();
      setMessage("A conta autenticou, mas não possui permissão administrativa.");
      setBusy(false);
      return;
    }

    void navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldCheck />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">AdminEdu</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-slate-600">Área restrita a utilizadores autorizados.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">E-mail institucional</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Palavra-passe</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>

          {message && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p>}

          <button
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            <LockKeyhole size={17} /> {busy ? "A autenticar..." : "Entrar no AdminEdu"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-amber-700">Voltar ao site público</Link>
        </div>
      </section>
    </main>
  );
}
