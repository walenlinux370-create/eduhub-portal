# Testes de Aceitação de Segurança

Esta etapa adiciona uma barreira de regressão para as proteções críticas do portal.

## Cobertura automatizada

O teste `tests/security/security-contract.test.ts` verifica no CI/test runner se as migrations mantêm:

1. RLS nas tabelas com dados escolares e de auditoria.
2. Negação de acesso direto do navegador às tabelas sensíveis.
3. Código de acesso do aluno armazenado somente como hash bcrypt.
4. Código com 12 caracteres e bloqueio após 5 falhas por 15 minutos.
5. Operações administrativas condicionadas a AAL2.
6. Notas publicadas protegidas contra edição por professor.
7. Notas limitadas ao intervalo 0–20 e componentes em JSON object.
8. Storage de materiais privado, limitado a 50 MB e com escopo por turma/disciplina.
9. Notícias públicas somente quando publicadas.
10. Logs de auditoria imutáveis e com redacção de segredos.

## Execução

```bash
npm test -- --run
```

### Importante

Estes testes são **contratos de segurança das migrations**: impedem regressões acidentais no código versionado. Eles não substituem um teste de integração contra uma instância Supabase real.

Antes de produção, deve ser executada uma segunda camada de testes de integração com contas reais de aluno, professor e administrador AAL2, verificando RLS e permissões diretamente no PostgreSQL/Supabase.
