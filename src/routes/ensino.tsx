import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/ensino")({
  head: () => ({
    meta: [
      { title: "Níveis de Ensino — Escola Comunitária Jossyquina" },
      { name: "description", content: "Ensino primário e secundário (1.ª à 12.ª classe) na Escola Comunitária Jossyquina." },
      { property: "og:title", content: "Níveis de Ensino — Jossyquina" },
      { property: "og:description", content: "Do ensino primário ao secundário, um percurso completo." },
    ],
  }),
  component: Ensino,
});

const niveis = [
  { t: "Ensino Primário", c: "1.ª à 6.ª classe", d: "Leitura, escrita, matemática e ciências com foco nas bases e nos valores." },
  { t: "Secundário — 1.º Ciclo", c: "7.ª à 9.ª classe", d: "Aprofundamento das disciplinas nucleares e iniciação às ciências e línguas." },
  { t: "Secundário — 2.º Ciclo", c: "10.ª à 12.ª classe", d: "Preparação para exames nacionais, ensino superior e vida profissional." },
];

function Ensino() {
  return (
    <>
      <PageHeader eyebrow="Oferta educativa" title="Um percurso completo, da 1.ª à 12.ª classe" />
      <Section>
        <div className="space-y-6">
          {niveis.map((n) => (
            <div key={n.t} className="grid gap-4 rounded-lg border border-border bg-card p-8 shadow-card md:grid-cols-[1fr_2fr]">
              <div>
                <h2 className="text-2xl font-semibold text-primary">{n.t}</h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-gold">{n.c}</p>
              </div>
              <p className="text-muted-foreground">{n.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
