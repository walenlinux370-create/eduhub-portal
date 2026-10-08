# Checklist de Segurança v2

- [x] RLS nas tabelas académicas.
- [x] Funções sensíveis protegidas por privilégios.
- [x] Auditoria imutável.
- [x] Identidade das notas protegida por trigger.
- [x] Nota final calculada no servidor/BD.
- [x] Professor limitado às suas alocações.
- [x] Professores sem DELETE de notas.
- [x] Materiais em bucket privado.
- [x] Validação de magic bytes.
- [x] Portal protegido contra alteração arbitrária de student_id.
- [x] Sanitização CMS.
- [x] Whitelist de vídeo.
- [x] Headers de segurança base.
- [x] RBAC nas áreas protegidas.

## Antes do deploy
- [ ] Executar migrations no Supabase de staging.
- [ ] Executar tests/security.sql na BD real.
- [ ] Confirmar MFA TOTP para todos os admins/docentes.
- [ ] Configurar rate limiting distribuído/global.
- [ ] Configurar CAPTCHA/anti-bot.
- [ ] Configurar antivírus para uploads.
- [ ] Configurar backups cifrados e teste de restauro.
- [ ] Configurar domínio oficial e CORS exato.
- [ ] Rever CSP final.
- [ ] Executar auditoria de dependências.
- [ ] Revisão jurídica da privacidade para Moçambique.
