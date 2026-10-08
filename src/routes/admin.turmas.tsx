import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
export const Route = createFileRoute("/admin/turmas")({
  head: () => ({ meta: [{ title: "Turmas — Painel Administrativo" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração</p><h2 className="mt-1 text-3xl font-bold text-primary">Turmas</h2><div className="mt-6 rounded-xl border bg-background p-6"><p className="font-semibold text-primary">Gestão de turmas e anos letivos.</p><p className="mt-2 text-sm text-muted-foreground">Módulo protegido por sessão administrativa e MFA AAL2. A interface de gestão detalhada será ligada às tabelas e funções RLS existentes.</p></div></AdminShell>,
});
