import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e proteção de dados — Escola Comunitária Jossyquina" },
      { name: "description", content: "Informação sobre privacidade, proteção de dados e segurança dos estudantes e encarregados de educação." },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <>
      <PageHeader
        eyebrow="Protecção de dados"
        title="Privacidade e segurança"
        intro="A Escola Comunitária Jossyquina trata os dados pessoais com responsabilidade, especialmente quando dizem respeito a crianças e adolescentes."
      />
      <Section className="max-w-4xl space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-primary">1. Que dados podem ser recolhidos</h2>
          <p className="mt-3 text-muted-foreground">Podemos solicitar dados necessários para atendimento, pré-inscrição e comunicação com a família, como nome, contactos, classe pretendida e informação do encarregado de educação.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary">2. Finalidade</h2>
          <p className="mt-3 text-muted-foreground">Os dados devem ser utilizados apenas para finalidades escolares e administrativas legítimas, incluindo pedidos de informação, processos de admissão, comunicação e prestação de serviços educativos.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary">3. Dados de menores</h2>
          <p className="mt-3 text-muted-foreground">Informações de estudantes menores devem ser tratadas com medidas reforçadas de segurança e acesso limitado às pessoas autorizadas. Fotografias ou outros conteúdos identificáveis só devem ser publicados quando existir a autorização adequada.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary">4. Segurança</h2>
          <p className="mt-3 text-muted-foreground">O sistema está a ser desenvolvido com controlo de acesso por função, políticas de segurança na base de dados, auditoria e proteção de dados sensíveis. Nenhum sistema online pode garantir risco zero, pelo que os acessos devem ser monitorizados e revistos regularmente.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary">5. Pedidos e dúvidas</h2>
          <p className="mt-3 text-muted-foreground">Para esclarecer questões sobre privacidade ou solicitar informação sobre os seus dados, contacte a secretaria através da página de contactos.</p>
        </section>
        <p className="border-t border-border pt-6 text-xs text-muted-foreground">Esta página é informativa e deve ser revista pela escola e por assessoria jurídica local antes da entrada em produção.</p>
      </Section>
    </>
  );
}
