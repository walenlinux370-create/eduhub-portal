# Implementação do Sistema Mestre v2

## Componentes completados
- RLS e isolamento docente.
- Imutabilidade da auditoria e identidade das notas.
- Cálculo de nota final exclusivamente no PostgreSQL.
- Materiais privados com URLs assinadas e validação de magic bytes.
- Inscrições com aprovação administrativa.
- Gestão hierárquica de estudantes por classe/turma.
- Presença, horários e materiais no portal do estudante.
- MFA para perfis administrativos/docentes através da integração de autenticação existente.
- CMS com sanitização de HTML e whitelist de vídeo.
- SEO base, sitemap, robots e Schema.org.

## Dependências externas
- MFA/TOTP deve estar configurado no Supabase.
- CAPTCHA requer um provedor e chaves.
- GA4 só deve funcionar após consentimento.
- Antivírus de uploads requer serviço externo.
- Backups/restauro devem ser configurados na infraestrutura.

O sistema não deve ser considerado production-ready apenas por compilar. Execute migrations em staging, testes SQL de segurança, testes de autenticação/MFA e revisão jurídica antes do lançamento.
