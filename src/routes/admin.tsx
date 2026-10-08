import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, GraduationCap, UserRoundCog, BookOpen, Newspaper, ClipboardList, ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Escola Jossyquina" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [s, setS] = useState({ students: 0, classes: 0, teachers: 0, subjects: 0, news: 0, pending: 0 });
  useEffect(() => {
    (async () => {
      const db = requireSupabase();
      const [students, classes, teachers, subjects, news, pending] = await Promise.all([
        db.from("students").select("id", { count: "exact", head: true }),
        db.from("classes").select("id", { count: "exact", head: true }),
        db.from("user_profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
        db.from("subjects").select("id", { count: "exact", head: true }),
        db.from("news").select("id", { count: "exact", head: true }),
        db.from("registration_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setS({ students: students.count ?? 0, classes: classes.count ?? 0, teachers: teachers.count ?? 0, subjects: subjects.count ?? 0, news: news.count ?? 0, pending: pending.count ?? 0 });
    })();
  }, []);

  const cards = [
    ["Alunos", s.students, Users, "/admin/alunos"],
    ["Turmas", s.classes, GraduationCap, "/admin/turmas"],
    ["Professores", s.teachers, UserRoundCog, "/admin/professores"],
    ["Disciplinas", s.subjects, BookOpen, "/admin/disciplinas"],
    ["Notícias", s.news, Newspaper, "/admin/noticias"],
    ["Inscrições pendentes", s.pending, ClipboardList, "/admin/alunos"],
  ] as const;

  return <AdminShell>
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Dashboard</p><h2 className="mt-1 text-3xl font-bold text-primary md:text-4xl">Painel da escola</h2><p className="mt-2 text-muted-foreground">Resumo da gestão da Escola Comunitária Jossyquina.</p></div>
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900"><strong>MFA:</strong> sessão verificada em AAL2</div>
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, value, Icon, to]) => <Link key={label} to={to} className="group rounded-xl border bg-background p-5 shadow-sm hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-md"><div className="flex justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700"><Icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1" /></div><p className="mt-5 text-3xl font-bold text-primary">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></Link>)}
    </div>
    <section className="mt-8 rounded-xl border bg-background p-6"><h3 className="text-lg font-bold text-primary">Módulos administrativos</h3><p className="mt-1 text-sm text-muted-foreground">Acesso rápido às áreas de gestão. Os dados continuam protegidos pelas políticas RLS do Supabase.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{[
        ["/admin/alunos", "Gestão de alunos", "Cadastro, aprovação e códigos de acesso."],
        ["/admin/turmas", "Gestão académica", "Turmas, disciplinas e atribuições."],
        ["/admin/notas", "Avaliação", "Notas, publicação e histórico."],
        ["/admin/noticias", "Conteúdos", "Notícias e comunicação institucional."],
      ].map(([to, title, desc]) => <Link key={to} to={to} className="rounded-lg border p-4 hover:border-yellow-400 hover:bg-yellow-50/50"><p className="font-semibold text-primary">{title}</p><p className="mt-1 text-sm text-muted-foreground">{desc}</p></Link>)}</div>
    </section>
  </AdminShell>;
}
