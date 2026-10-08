import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Users, GraduationCap, BookOpen, BarChart3, CalendarCheck, FileText, Newspaper, ShieldCheck, Settings, LogOut, UserRoundCog } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";

const items = [
  ["/admin", "Visão geral", LayoutDashboard],
  ["/admin/alunos", "Alunos", Users],
  ["/admin/turmas", "Turmas", GraduationCap],
  ["/admin/professores", "Professores", UserRoundCog],
  ["/admin/disciplinas", "Disciplinas", BookOpen],
  ["/admin/notas", "Notas", BarChart3],
  ["/admin/presencas", "Presenças", CalendarCheck],
  ["/admin/materiais", "Materiais", FileText],
  ["/admin/noticias", "Notícias", Newspaper],
  ["/admin/auditoria", "Auditoria", ShieldCheck],
  ["/admin/definicoes", "Definições", Settings],
] as const;

const CHECK_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), CHECK_TIMEOUT_MS);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("Administrador");
  const [checkStage, setCheckStage] = useState("A iniciar a validação…");

  useEffect(() => {
    let alive = true;

    async function checkAdminSession() {
      try {
        const supabase = requireSupabase();

        if (alive) setCheckStage("A validar a sessão segura…");
        const claimsResult = await withTimeout(
          supabase.auth.getClaims(),
          "A validação da sessão demorou demasiado tempo.",
        );

        if (claimsResult.error || !claimsResult.data?.claims?.sub) {
          throw claimsResult.error ?? new Error("Sessão administrativa inexistente.");
        }

        const claims = claimsResult.data.claims;
        const userId = claims.sub;

        if (alive) setCheckStage("A validar o perfil de administrador e o MFA…");
        const [profileResult, aalResult] = await withTimeout(
          Promise.all([
            supabase
              .from("user_profiles")
              .select("display_name,role,is_active")
              .eq("id", userId)
              .maybeSingle(),
            supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
          ]),
          "A validação administrativa demorou demasiado tempo.",
        );

        if (profileResult.error) {
          throw new Error(`Perfil administrativo: ${profileResult.error.message}`);
        }

        const profile = profileResult.data;
        if (
          !profile ||
          profile.role !== "admin" ||
          profile.is_active !== true ||
          aalResult.error ||
          aalResult.data.currentLevel !== "aal2"
        ) {
          void supabase.auth.signOut();
          if (alive) {
            void navigate({ to: "/admin/login", replace: true });
          }
          return;
        }

        if (alive) {
          setName(profile.display_name || String(claims.email ?? "Administrador"));
          setReady(true);
        }
      } catch (error) {
        console.error("Admin session check failed:", error);
        if (alive) {
          setCheckStage("A sessão não foi validada. A regressar ao login…");
          void navigate({ to: "/admin/login", replace: true });
        }
      }
    }

    void checkAdminSession();

    return () => {
      alive = false;
    };
  }, [navigate]);

  async function logout() {
    await requireSupabase().auth.signOut();
    await navigate({ to: "/admin/login", replace: true });
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-primary">A verificar sessão administrativa…</p>
          <p className="mt-2 text-xs text-muted-foreground">{checkStage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary text-primary-foreground lg:flex">
        <div className="border-b border-primary-foreground/10 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Jossyquina</p>
          <h1 className="mt-1 text-xl font-bold">Painel Administrativo</h1>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {items.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/admin" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-foreground/75 hover:bg-primary-foreground/10 [&.active]:bg-yellow-400 [&.active]:text-black"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-primary-foreground/10 p-4">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="mb-3 text-xs text-primary-foreground/60">Administrador · MFA ativo</p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Área reservada</p>
              <p className="text-sm text-muted-foreground">Gestão académica e administrativa</p>
            </div>
            <button onClick={logout} className="rounded-md border px-3 py-2 text-sm lg:hidden">
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
