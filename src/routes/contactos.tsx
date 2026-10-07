import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Section, btnPrimary } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos — Escola Comunitária Jossyquina" },
      { name: "description", content: "Fale com a secretaria da Escola Comunitária Jossyquina: endereço, telefone e email." },
      { property: "og:title", content: "Contactos — Jossyquina" },
      { property: "og:description", content: "Endereço, telefone, email e horário da secretaria." },
    ],
  }),
  component: Contactos,
});

const field = "w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Contactos() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Fale connosco" title="Contactos" intro="A secretaria está disponível de segunda a sexta, das 7h30 às 15h30." />
      <Section className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {[["Endereço", "Bairro (a definir), Moçambique"], ["Telefone", "+258 84 000 0000"], ["Email", "info@jossyquina.edu.mz"]].map(([l, v]) => (
            <div key={l}><p className="eyebrow">{l}</p><p className="mt-1 text-lg text-primary">{v}</p></div>
          ))}
        </div>
        {sent ? (
          <div className="rounded-lg border border-border bg-secondary p-8">
            <h2 className="text-2xl font-semibold text-primary">Obrigado pela sua mensagem!</h2>
            <p className="mt-2 text-muted-foreground">Entraremos em contacto brevemente.</p>
          </div>
        ) : (
          <form className="space-y-4 rounded-lg border border-border bg-card p-8 shadow-card" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input required placeholder="Nome completo" className={field} />
            <input required type="email" placeholder="Email" className={field} />
            <input placeholder="Telefone" className={field} />
            <textarea required rows={5} placeholder="Mensagem" className={field} />
            <button type="submit" className={btnPrimary}>Enviar mensagem</button>
          </form>
        )}
      </Section>
    </>
  );
}
