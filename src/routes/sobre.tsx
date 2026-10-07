import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — Escola Comunitária Jossyquina" },
      { name: "description", content: "História, missão, visão e valores da Escola Comunitária Jossyquina." },
      { property: "og:title", content: "Sobre a Escola Comunitária Jossyquina" },
      { property: "og:description", content: "História, missão, visão e valores da nossa escola." },
    ],
  }),
  component: Sobre,
});

const valores = ["Respeito", "Responsabilidade", "Solidariedade", "Excelência", "Integridade", "Comunidade"];

function Sobre() {
  return (
    <>
      <PageHeader eyebrow="Quem somos" title="Uma escola nascida da comunidade" intro="Fundada pela vontade das famílias locais, a Jossyquina cresceu para se tornar uma referência de ensino na região." />
      <Section className="grid gap-12 md:grid-cols-2">
        <div>
          <span className="gold-rule" />
          <h2 className="mt-4 text-3xl font-semibold text-primary">Missão</h2>
          <p className="mt-3 text-muted-foreground">Oferecer educação de qualidade, acessível e humanizada, que prepare os estudantes para a vida, o trabalho e a cidadania.</p>
        </div>
        <div>
          <span className="gold-rule" />
          <h2 className="mt-4 text-3xl font-semibold text-primary">Visão</h2>
          <p className="mt-3 text-muted-foreground">Ser reconhecida como a escola comunitária de excelência, formando gerações que transformam Moçambique.</p>
        </div>
      </Section>
      <section className="bg-secondary">
        <Section>
          <p className="eyebrow">Os nossos valores</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {valores.map((v) => (
              <div key={v} className="rounded-lg border border-border bg-card p-6 font-display text-xl text-primary">{v}</div>
            ))}
          </div>
        </Section>
      </section>
    </>
  );
}
