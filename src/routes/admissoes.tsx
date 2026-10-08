import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section, btnPrimary } from "@/components/site/SiteLayout";

const ENROLLMENT_POSTER_URL = "https://raw.githubusercontent.com/walenlinux370-create/jossyquina/main/assets/matriculas.webp";

export const Route = createFileRoute("/admissoes")({
  head: () => ({
    meta: [
      { title: "Admissões 2027 — Escola Comunitária Jossyquina" },
      { name: "description", content: "Como inscrever o seu educando na Escola Comunitária Jossyquina: passos, documentos e prazos." },
      { property: "og:title", content: "Admissões 2027 — Jossyquina" },
      { property: "og:description", content: "Passos, documentos e prazos de inscrição." },
    ],
  }),
  component: Admissoes,
});

const passos = [
  ["Pré-inscrição", "Dirija-se à secretaria ou contacte-nos para reservar a vaga."],
  ["Entrega de documentos", "Apresente a documentação exigida para a classe pretendida."],
  ["Confirmação da matrícula", "Pagamento da taxa de matrícula e recepção do horário."],
];
const docs = ["Cópia do BI ou Cédula Pessoal", "Certificado ou declaração da classe anterior", "2 fotografias tipo passe", "Cartão de vacinas (ensino primário)"];

function Admissoes() {
  return (
    <>
      <PageHeader eyebrow="Ano lectivo 2027" title="Admissões e matrículas" intro="Inscrições abertas até 30 de Novembro. Vagas limitadas por turma." />
      <Section>
        <div className="mb-12 overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <img src={ENROLLMENT_POSTER_URL} alt="Cartaz oficial de matrículas 2027" className="mx-auto max-h-[620px] w-full object-contain" />
        </div>
      </Section>
      <Section className="grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-primary">Como se inscrever</h2>
          <ol className="mt-6 space-y-6">
            {passos.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-gold">{i + 1}</span>
                <div><p className="font-semibold text-primary">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-8">
          <h2 className="text-2xl font-semibold text-primary">Documentos necessários</h2>
          <ul className="mt-5 space-y-3">
            {docs.map((d) => (<li key={d} className="flex gap-3 text-sm"><span className="text-gold">◆</span>{d}</li>))}
          </ul>
          <Link to="/contactos" className={`${btnPrimary} mt-8`}>Pedir informações</Link>
        </div>
      </Section>
    </>
  );
}
