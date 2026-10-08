import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { ADMINEDU_SYSTEM_PROMPT, CRITICAL_ACTIONS } from "@/lib/adminedu/policy";

export const Route = createFileRoute("/admin")({
  component: AdminEduPage,
});

type SessionUser = {
  email?: string;
  app_metadata?: Record<string, unknown>;
};

function isAdmin(user: SessionUser | null) {
  return user?.app_metadata?.role === "admin" || user?.app_metadata?.admin === true;
}

function AdminEduPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = requireSupabase();

    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError || !data.user) {
        void navigate({ to: "/admin/login" });
        return;
      }
      if (!isAdmin(data.user)) {
        setError("A sua conta está autenticada, mas não possui permissão administrativa.");
        setLoading(false);
        return;
      }
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) void navigate({ to: "/admin/login" });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <CenteredState text="A validar o acesso seguro..." />;
  if (error) return <CenteredState text={error} danger />;

  const modules = [
    { icon: Users, title: "Alunos", text: "Gestão com minimização e referências anonimizadas." },
    { icon: GraduationCap, title: "Professores", text: "Acompanhamento pedagógico e responsabilidades." },
    { icon: BookOpen, title: "Ensino", text: "Turmas, disciplinas, horários e materiais." },
    { icon: BarChart3, title: "Indicadores", text: "Métricas agregadas, sem exposição individual." },
    { icon: ClipboardList, title: "Frequência", text: "Presenças e padrões de acompanhamento." },
    { icon: ShieldCheck, title: "Conformidade", text: "Privacidade, auditoria e controlos de acesso." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">AdminEdu</p>
            <h1 className="text-xl font-semibold">Painel de Gestão Escolar</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-300 md:block">{user?.email ?? "Utilizador autorizado"}</span>
            <button
              className="rounded-md border border-slate-700 p-2 md:hidden"
              onClick={() => setOpenMenu(!openMenu)}
              aria-label="Abrir menu"
            >
              {openMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              className="hidden items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 md:flex"
              onClick={async () => {
                await requireSupabase().auth.signOut();
                void navigate({ to: "/admin/login" });
              }}
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
        {openMenu && (
          <div className="border-t border-slate-800 px-5 py-3 md:hidden">
            <button
              className="flex items-center gap-2 text-sm text-amber-300"
              onClick={async () => {
                await requireSupabase().auth.signOut();
                void navigate({ to: "/admin/login" });
              }}
            >
              <LogOut size={16} /> Terminar sessão
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-semibold">AdminEdu pronto</h2>
              <p className="mt-1 text-sm text-slate-700">
                Acesso protegido. O painel trabalha por princípio de minimização e não apresenta dados pessoais identificáveis por defeito.
              </p>
            </div>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Alunos ativos", "Agregado"],
            ["Frequência média", "Agregado"],
            ["Turmas", "Agregado"],
            ["Alertas", "Revisão humana"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <LayoutDashboard size={20} />
            <h2 className="text-xl font-semibold">Módulos</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-xl border bg-white p-5 shadow-sm">
                <Icon className="text-slate-700" size={22} />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 text-amber-600" size={20} />
            <div>
              <h2 className="font-semibold">Ações críticas</h2>
              <p className="mt-1 text-sm text-slate-600">
                Nenhuma destas ações deve ser executada automaticamente ou em lote.
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                {CRITICAL_ACTIONS.map((action) => <li key={action}>• {action}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <details className="mt-8 rounded-xl border bg-white p-5">
          <summary className="cursor-pointer font-semibold">Política AdminEdu</summary>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{ADMINEDU_SYSTEM_PROMPT}</p>
        </details>

        <div className="mt-8 text-sm">
          <Link to="/" className="font-semibold text-slate-700 hover:text-amber-700">← Voltar ao site público</Link>
        </div>
      </main>
    </div>
  );
}

function CenteredState({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className={`max-w-lg rounded-xl border bg-white p-8 text-center shadow-sm ${danger ? "border-red-200" : ""}`}>
        <ShieldCheck className={`mx-auto mb-4 ${danger ? "text-red-500" : "text-amber-500"}`} />
        <p className="text-sm text-slate-700">{text}</p>
        {danger && <Link to="/admin/login" className="mt-5 inline-block font-semibold text-slate-900">Voltar ao acesso</Link>}
      </div>
    </main>
  );
}
