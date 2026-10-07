import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-escola.jpg";
import { Section, btnGold, btnOutline, btnPrimary } from "@/components/site/SiteLayout";
import { news } from "@/lib/news";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escola Comunitária Jossyquina — Educar com rigor e valores" },
      { name: "description", content: "Ensino primário e secundário de qualidade ao serviço da comunidade. Conheça a Escola Comunitária Jossyquina." },
      { property: "og:title", content: "Escola Comunitária Jossyquina" },
      { property: "og:description", content: "Ensino primário e secundário de qualidade ao serviço da comunidade." },
    ],
  }),
  component: Index,
});

const pillars = [
  { n: "01", t: "Excelência académica", d: "Currículo nacional reforçado com acompanhamento próximo de cada estudante." },
  { n: "02", t: "Valores e disciplina", d: "Formamos cidadãos responsáveis, respeitadores e solidários." },
  { n: "03", t: "Raízes na comunidade", d: "Uma escola feita pelas famílias, para as famílias do bairro." },
];

function Index() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Estudantes da Escola Comunitária Jossyquina no pátio" width={1600} height={1008} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto max-w-6xl px-5 py-28 md:py-40">
          <p className="eyebrow">Escola Comunitária</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] text-primary-foreground md:text-7xl">
            Educar hoje, transformar o amanhã.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            Na Jossyquina, cada estudante encontra rigor, cuidado e oportunidades para crescer.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/admissoes" className={btnGold}>Inscrições 2027</Link>
            <Link to="/sobre" className={btnOutline}>Conheça a escola</Link>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.n} className="border-t-2 border-gold pt-6">
              <p className="font-display text-3xl text-gold">{p.n}</p>
              <h3 className="mt-3 text-2xl font-semibold text-primary">{p.t}</h3>
              <p className="mt-2 text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 text-center md:grid-cols-4">
          {[["600+", "Estudantes"], ["35", "Professores"], ["1.ª–12.ª", "Classes"], ["15", "Anos de história"]].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-4xl font-semibold text-primary">{v}</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Actualidade</p>
            <h2 className="mt-2 text-4xl font-semibold text-primary">Últimas notícias</h2>
          </div>
          <Link to="/noticias" className="text-sm font-semibold text-primary underline decoration-gold underline-offset-4">Ver todas</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <article key={n.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{n.date} · <span className="text-gold">{n.tag}</span></p>
              <h3 className="mt-3 text-xl font-semibold text-primary">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.excerpt}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
          <h2 className="max-w-xl text-3xl font-semibold text-primary-foreground">Pronto para fazer parte da família Jossyquina?</h2>
          <Link to="/contactos" className={btnGold}>Fale connosco</Link>
        </div>
      </section>
      <span className="hidden">{btnPrimary}</span>
    </>
  );
}
