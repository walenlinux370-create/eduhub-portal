import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
export const Route = createFileRoute("/admin/notas")({
  head: () => ({ meta: [{ title: "Notas — Painel Administrativo" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AdminShell><p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração</p><h2 className="mt-1 text-3xl font-bold text-primary">Notas</h2><div className="mt-6 rounded-xl border bg-background p-6"><p className="font-semibold text-primary">Avaliações e publicação de notas.</p><p className="mt-2 text-sm text-muted-foreground">Módulo protegido por sessão administrativa e MFA AAL2. A interface de gestão detalhada será ligada às tabelas e funções RLS existentes.</p></div></AdminShell>,
});
