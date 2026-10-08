import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal de Acesso — AdminEdu | Escola Comunitária Jossyquina" },
      {
        name: "description",
        content: "Portal seguro de acesso ao painel administrativo e pedagógico AdminEdu.",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary">
      <section className="mx-auto flex max-w-5xl items-center px-5 py-16 md:py-24">
        <div className="grid w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Acesso institucional
            </div>

            <p className="eyebrow mt-8">AdminEdu</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-primary md:text-5xl">
              Portal de acesso ao painel
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Área reservada para gestão operacional, pedagógica, indicadores e conformidade da escola.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
              >
                Aceder ao painel AdminEdu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Voltar ao site
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              O acesso é controlado pelo sistema institucional. Nunca partilhe palavras-passe,
              códigos ou chaves de acesso.
            </p>
          </div>

          <div className="flex flex-col justify-center bg-primary p-8 text-primary-foreground md:p-12">
            <LockKeyhole className="h-10 w-10 text-gold" />
            <h2 className="mt-6 text-2xl font-semibold">Acesso protegido</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
              Depois da autenticação, apenas contas com permissão administrativa podem entrar no
              painel AdminEdu.
            </p>

            <div className="mt-8 space-y-4 border-t border-primary-foreground/10 pt-6 text-sm">
              <div>
                <p className="font-semibold text-gold">Privacidade</p>
                <p className="mt-1 text-primary-foreground/70">
                  Dados escolares devem ser tratados apenas dentro das permissões atribuídas.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gold">Segurança</p>
                <p className="mt-1 text-primary-foreground/70">
                  Ações administrativas críticas exigem confirmação explícita.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
