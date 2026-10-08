# Fase D — Evidências de Segurança e Testes de Regressão

## Estado
**CONCLUÍDA**

A Fase D valida, no banco de dados, as principais barreiras contra IDOR, escalada de privilégios, autoaprovação, transições indevidas de estado e adulteração da cadeia de auditoria.

## Testes executados

- **D-01 — SECURITY DEFINER:** nenhuma função SECURITY DEFINER crítica ficou executável por `anon` ou `authenticated`.
- **D-02 — RLS:** tabelas protegidas permanecem com Row Level Security ativo.
- **D-03 — IDOR:** o acesso a folhas/notas permanece limitado ao proprietário/escopo autorizado.
- **D-04 — Autoaprovação:** a estrutura do banco impede aprovação pelo próprio criador.
- **D-05 — Máquina de estados:** o trigger de transição de `grade_sheets` está instalado e bloqueia transições inválidas.
- **D-06 — Cadeia de auditoria:** a auditoria usa SHA-256, ordenação protegida e lock transacional.
- **D-07 — Integridade da cadeia:** foi criado um teste controlado de dois eventos para confirmar `previous_hash = event_hash` do evento anterior; os dados de teste foram revertidos.

**Resultado: D-01 a D-07 — PASS.**

## Estado dos dados durante a validação

Os testes foram executados sem dados pessoais reais. No momento da validação, as tabelas de negócio verificadas estavam sem registos de dados pessoais.

## Segurança Advisor

Após a Fase D, o único alerta observado foi **Leaked Password Protection Disabled** no Supabase Auth. Este alerta é uma configuração do serviço de autenticação e deve ser tratado na Fase E.

## Próxima fase

A **Fase E** deverá tratar hardening operacional e recuperação: proteção contra passwords comprometidas, sessões/reauthentication, lockout e timeout, uploads, duplicidade de contas, retenção/eliminação de dados, snapshots, backups/restore e demais controles de infraestrutura.

> Nota: esta documentação registra os resultados de segurança; não deve ser interpretada como garantia de segurança absoluta.
