import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/SiteLayout";
import { news } from "@/lib/news";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias e Eventos — Escola Comunitária Jossyquina" },
      { name: "description", content: "Novidades, eventos e comunicados da Escola Comunitária Jossyquina." },
      { property: "og:title", content: "Notícias — Jossyquina" },
      { property: "og:description", content: "Novidades, eventos e comunicados da escola." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  return (
    <>
      <PageHeader eyebrow="Actualidade" title="Notícias e eventos" />
      <Section>
        <div className="divide-y divide-border">
          {news.map((n) => (
            <article key={n.title} className="grid gap-3 py-8 md:grid-cols-[180px_1fr]">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">{n.date}<br /><span className="text-gold">{n.tag}</span></p>
              <div>
                <h2 className="text-2xl font-semibold text-primary">{n.title}</h2>
                <p className="mt-2 text-muted-foreground">{n.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
