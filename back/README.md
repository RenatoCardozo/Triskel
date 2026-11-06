# back · API da Triskel

API REST em **Node 22 + TypeScript + Fastify 5**, com **Prisma 7 + MySQL**. Cuida de contas e sessões, perfis, busca de criadores e oportunidades, campanhas, negociação (propostas, contrapropostas, mensagens), contrato com assinatura e PDF, carteira (recarga, custódia, saque), entregas com análise por IA, publicação e avaliações. Conversa com `payment-sim` (pagamentos), `video-ai` (análise) e `email-sim` (SMTP).

Documentação interativa (OpenAPI/Swagger) em `http://localhost:4000/docs`.

## Como rodar

Pré-requisitos: Node 22+, MySQL 8 (ou MariaDB 10.6+) e, para o fluxo completo, os outros serviços (veja o README da raiz; o `docker-compose.yml` sobe tudo).

```bash
cp .env.example .env            # ajuste DATABASE_URL e os segredos
npm install
npm run prisma:generate         # gera o cliente Prisma em src/generated (não vai para o git)
npm run db:migrate:local        # aplica prisma/migrations (veja "Migrações" abaixo)
npm run db:seed                 # dados de demonstração do protótipo (só em banco vazio)
npm run dev                     # http://localhost:4000
```

Usuários do seed (senha `Triskel@2026`): `marjorie@email.com` (criadora), `contato@docevale.com.br` (empresa Doce Vale), `oi@maredigital.com.br` (agência Maré Digital). Os outros criadores e contratantes de apoio do protótipo também existem (veja `prisma/seed.ts`).

### Migrações

`prisma/migrations` guarda o SQL de MySQL (`init` e `ledger_immutable`, que cria os gatilhos que impedem alterar/apagar o ledger). Duas formas de aplicar:

- `npm run db:migrate:local` (`scripts/apply-migrations.mjs`): aplica os `.sql` pendentes e registra em `_prisma_migrations` no mesmo formato do Prisma. É o que o container usa.
- `npm run db:migrate` (`prisma migrate deploy`): caminho oficial do Prisma, equivalente.

> O SQL de `init` foi **gerado por `scripts/gen-migration.mjs` a partir do schema** porque o binário `schema-engine` do Prisma não pôde ser baixado no ambiente em que o projeto foi construído. Em uma máquina com rede, rode `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` e confirme que o resultado é vazio. Isso **não foi executado** aqui.

## Testes

```bash
npm run test:unit          # regras puras, sem banco (34 testes)
npm run test:integration   # API real contra MySQL/MariaDB (45 testes). O banco de teste é APAGADO e recriado.
npm test                   # os dois
```

`TEST_DATABASE_URL` (padrão `mysql://triskel:triskel@127.0.0.1:3306/triskel_test`) precisa apontar para um banco **de teste**: o nome deve conter `test` ou o setup se recusa a rodar. O usuário precisa poder criar/apagar esse banco.

O que está coberto: taxa de 10% em centavos; bloqueio de contato; CPF/CNPJ/telefone/senha; exclusividade (janela inclusiva, ramos relacionados, bidirecional, só contrato assinado pelas duas partes, marca nunca revelada ao contratante); alternância de turno e concorrência (aceitar × recusar); IDOR (404 para terceiros em propostas, contratos, campanhas, entregas, arquivos); RBAC; rotação e reuso de refresh token; bloqueio por tentativas e rate limit; pagamento (saldo insuficiente, duplo/concorrente, ledger = saldo, ledger imutável); custódia liberada uma só vez; saque concorrente sem saldo negativo e estorno único; webhooks (HMAC, janela de tempo, adulteração, idempotência, valor divergente); contrato congelado com hash e PDF; upload (conteúdo real, não extensão; URL assinada expira); fluxo de entrega até a liberação do pagamento.

O que **não** está coberto por testes automatizados deste projeto: chamadas reais ao payment-sim e ao video-ai (os testes do back as simulam; o fluxo real é exercido no teste ponta a ponta da raiz) e o caminho do LLM do video-ai.

## Segurança (decisões)

- **Senhas**: bcrypt com custo mínimo 12 (a aplicação não sobe com menos). Política de senha no cadastro. Mensagem de erro de login igual para e-mail inexistente e senha errada; bloqueio temporário depois de várias tentativas.
- **Sessão**: JWT de acesso curto (15 min, HS256, `iss`/`aud` verificados) e refresh token opaco, rotativo, guardado só como hash SHA-256, com revogação. Reuso de refresh antigo revoga a família inteira. O front guarda os tokens em cookies `httpOnly` (BFF); o navegador nunca vê o token.
- **Autorização**: papéis por rota e verificação de dono em cada recurso. Quem não é parte recebe **404** (sem enumeração de IDs). Contratante e criador veem valores diferentes (o criador nunca vê a taxa).
- **Dinheiro**: centavos inteiros; débito condicional (`UPDATE ... WHERE saldo >= x`); `SELECT ... FOR UPDATE` nas transições críticas; chaves de idempotência nas recargas e saques; ledger imutável por gatilho no banco; custódia (`Escrow`) liberada uma única vez.
- **Webhooks** (recebidos e emitidos): `X-Triskel-Signature: sha256=HMAC(segredo, timestamp + "." + corpo)`, tolerância de 5 min, deduplicação por `X-Triskel-Event-Id`. Se o processamento falha, o registro de dedupe é removido e a resposta é 500 para o emissor tentar de novo.
- **Cartão**: o número e o CVV nunca chegam ao back. O navegador tokeniza no payment-sim (chave pública) e o back recebe só o token de uso único. Cartões salvos guardam só a referência do cofre do gateway.
- **Uploads**: tipo detectado pelos bytes (JPEG/PNG/WebP e MP4/MOV/WebM), limite de tamanho, gravação em streaming, nome aleatório, SHA-256, servidos só às partes autorizadas. A URL que o video-ai usa para baixar o vídeo é assinada e expira.
- **HTTP**: helmet, CORS com lista de origens, rate limit global e por rota sensível, validação de toda entrada com zod (campos desconhecidos são recusados), erros sem stack trace, logs pino sem dados sensíveis.
- **Segredos**: só por variável de ambiente. Em `NODE_ENV=production` a aplicação recusa subir com os valores de exemplo do `.env.example`.

## Estrutura

```
prisma/        schema, migrações, seed (e seed-data/news.json)
scripts/       apply-migrations.mjs, gen-migration.mjs, entrypoint.sh (container)
src/routes/    uma rota por área (auth, me, campaigns, proposals, contracts, wallet, deliveries, reviews, dashboard, files, webhooks)
src/services/  regras de negócio
src/lib/       utilitários puros (money, leak, exclusivity, contractModel/Pdf, webhook, validators, payment, videoai, storage)
src/jobs/      confirmação de publicação e análises que nunca voltaram
test/          unit/ e integration/
```

## Limitações conhecidas

- **Verificação de publicação é simulada** (`simulatedVerifier` só confere o formato do link). A interface `PublicationVerifier` existe para plugar uma verificação real; as redes sociais não oferecem isso de forma aberta.
- O armazenamento é em disco (`STORAGE_DIR`); a interface `Storage` permite trocar por S3.
- A taxa da Triskel não vira lançamento em uma carteira da plataforma: ela é registrada no pagamento (`MoneyTx.feeCents`).
- Sem painel administrativo, sem moderação, sem disputa de pagamento (fora do protótipo).
