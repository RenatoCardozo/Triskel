# Triskel

Plataforma que conecta **criadores de conteúdo (UGC)**, **comércios** e **agências**: busca com compatibilidade, proposta e contraproposta, contrato com assinatura digital, pagamento em custódia, entrega de vídeo com análise por IA, aprovação, confirmação de publicação, liberação do valor e saque.

Esta é a versão **funcional** do protótipo navegável (`reference/triskel_prototipo.html`). Só existe aqui o que existe no protótipo; o que ficou de fora está em [`docs/ESCOPO.md`](docs/ESCOPO.md), seção 9.

## Projetos (monorepo)

| Pasta | O que é | Porta |
|---|---|---|
| `front/` | Next.js 15 (App Router, TypeScript, Tailwind). BFF com cookies httpOnly, middleware por papel | 3000 |
| `back/` | API Fastify + TypeScript, Prisma + MySQL, OpenAPI em `/docs` | 4000 |
| `payment-sim/` | Gateway de pagamento simulado (Pix, cartão com 3DS, saque), com painel de administração e webhooks assinados | 4100 |
| `email-sim/` | Servidor SMTP de captura + caixa de entrada web (nenhum e-mail sai da máquina) | 4200 (web), 2525 (SMTP) |
| `video-ai/` | Serviço de análise de vídeo (ffprobe/ffmpeg; LLM opcional) com callback assinado | 4300 |
| `e2e/` | Roteiro Playwright do fluxo completo | n/a |
| `docs/ESCOPO.md` | Escopo, modelo de dados, máquinas de estado, contratos de integração, decisões | n/a |
| MySQL | Banco do back | 3306 |

Cada projeto tem `package.json`, `README.md`, `.env.example` e `Dockerfile`.

## Arquitetura

```
Navegador ──► front :3000 ──(BFF /api/bff, cookies httpOnly)──► back :4000 ──► MySQL
   │                                                        │  ├─► payment-sim :4100 (cobranças, saques)
   │                                                        │  ├─► video-ai    :4300 (análise do vídeo)
   │                                                        │  └─► email-sim   :2525 (SMTP)
   └─ cartão: token direto no payment-sim (chave pública)   │
payment-sim ──webhook HMAC──► back /webhooks/payments       │
video-ai    ──callback HMAC─► back /webhooks/video-ai ──────┘
```

- O navegador **nunca** recebe token: o front guarda o JWT de acesso e o refresh em cookies httpOnly e fala com o back por um proxy (BFF).
- O dinheiro é guardado em **centavos inteiros**, com um livro-razão imutável (gatilhos no banco impedem alterar ou apagar lançamentos). A taxa de 10% é paga pelo contratante, por cima; o criador recebe o valor cheio.
- Webhooks nos dois sentidos assinados com HMAC-SHA256 sobre `timestamp.corpo`, janela de 5 minutos e idempotência por `X-Triskel-Event-Id`.

## Como rodar

### Com Docker (recomendado)

```bash
./scripts/gen-env.sh                     # cria o .env com segredos aleatórios (não vai para o git)
# opcional: SEED_ON_START=true no .env para popular o banco vazio com os dados do protótipo
docker compose up --build
```

Abra http://localhost:3000. A caixa de e-mail (códigos de verificação) fica em http://localhost:4200; o painel do gateway, em http://localhost:4100 (chave de administração `PAYSIM_ADMIN_KEY`, do `.env`).

Com `SEED_ON_START=true`, entre com `marjorie@email.com` (criadora), `contato@docevale.com.br` (comércio) ou `oi@maredigital.com.br` (agência); senha `Triskel@2026` (ou `SEED_PASSWORD`). Dados de demonstração, não use em produção.

> O `docker compose` **não foi executado** no ambiente em que isto foi construído (o registro de imagens estava bloqueado). O arquivo foi validado com `docker compose config`; o que rodou foi cada serviço direto no Node, descrito abaixo.

### Hospedagem gratuita (demonstração)

`render.yaml` + [`docs/DEPLOY.md`](docs/DEPLOY.md): Render (5 serviços) e MySQL gratuito da Aiven. Nessa hospedagem o back envia o e-mail por HTTP (`MAIL_TRANSPORT=http`) em vez de SMTP, e a conexão com o banco usa TLS (`DATABASE_SSL=true`).

### Sem Docker (desenvolvimento)

Requer Node 22, MySQL 8 (ou MariaDB 10.11) e ffmpeg. Em cada pasta: `cp .env.example .env`, ajuste os segredos para que casem entre os serviços (veja os comentários nos `.env.example`) e rode:

```bash
(cd email-sim   && npm ci && npm run dev)
(cd payment-sim && npm ci && npm run dev)
(cd video-ai    && npm ci && npm run dev)
(cd back  && npm ci && npm run prisma:generate && npm run db:migrate:local && npm run db:seed && npm run dev)
(cd front && npm ci && cp .env.example .env.local && npm run dev)
```

## Fluxo de ponta a ponta

1. Cadastro dos 3 perfis (CPF/CNPJ validados, senha forte) e **validação do e-mail** com o código recebido no email-sim.
2. Perfil completo (foto, capa e campos obrigatórios); só então o perfil fica visível nas buscas.
3. **Recarga por Pix** (QR + copia e cola); o pagamento é confirmado no gateway e chega ao back por webhook assinado. Cartão: token no navegador, 3DS de teste (`123456`).
4. Comércio ou agência cria a **campanha**, confirma os requisitos e **busca criadores** com compatibilidade e aviso de conflito de exclusividade.
5. **Proposta → contraproposta → aceite** (turnos alternados, taxa de 10% visível, bloqueio de telefone/e-mail/links nas mensagens).
6. Pagamento com saldo: o valor vai para **custódia**; assinatura do contratante; **assinatura do criador**; **PDF final** com hash e assinaturas.
7. Criador envia o **vídeo**; a **IA** confere o briefing; contratante aprova ou pede ajustes.
8. Criador informa o link; a Triskel **confirma a publicação** (verificador simulado); a **custódia é liberada**.
9. **Saque** por Pix; avaliações mútuas.

O roteiro `e2e/e2e.mjs` executa tudo isso (cadastro, e-mail, Pix, busca, proposta, contraproposta, aceite, pagamento, assinatura, PDF, vídeo, IA, ajustes, aprovação, publicação, liberação e saque, mais checagens de RBAC, CSRF e propriedade) contra a stack no ar. Veja `e2e/README.md`.

## Testes e verificações

| O que | Como | Resultado nesta entrega |
|---|---|---|
| back (regras críticas: dinheiro, ledger, custódia, exclusividade, máquina de proposta, RBAC, webhooks, tokens) | `cd back && npm test` | 79 testes passando (MariaDB local) |
| payment-sim | `cd payment-sim && npm test` | 18 testes |
| video-ai | `cd video-ai && npm test` | 11 testes |
| email-sim | `cd email-sim && npm test` | 4 testes |
| front: tipos e build | `cd front && npm run typecheck && npm run build` | passam |
| E2E completo (Playwright, Chrome) | `cd e2e && npm ci && npm run e2e` | todos os passos passaram |
| front em 1280 px e 390 px | `e2e/shots.mjs` (capturas de tela) | páginas dos 3 perfis sem erro de console e sem rolagem horizontal |

## Segurança (resumo)

- **Senhas**: bcrypt custo 12. **Sessão**: JWT de acesso de 15 min + refresh rotativo (guardado só como hash, com detecção de reuso e revogação de toda a família ao trocar a senha).
- **Autorização**: papéis (RBAC) no back e no middleware do front; toda leitura/escrita de recurso checa o **dono** (propostas, contratos, entregas, carteira, arquivos).
- **Entrada**: zod em todas as rotas; corpo desconhecido é recusado (`strict`). Upload de arquivo valida o tipo pelo conteúdo (magic bytes), limita o tamanho e serve por URL assinada com `nosniff`.
- **Navegador**: CSP com nonce por requisição, cookies httpOnly + SameSite=Lax, checagem de `Origin` no BFF (CSRF), `helmet` no back, CORS com lista de origens, `X-Frame-Options`/`Referrer-Policy`/`Permissions-Policy`.
- **Abuso**: rate limit global e mais estrito em login, cadastro, códigos e dinheiro; chaves de idempotência (`Idempotency-Key`) em recargas e saques.
- **Webhooks**: HMAC-SHA256 com comparação em tempo constante, janela de 5 minutos e deduplicação por id de evento.
- **SSRF**: o video-ai só baixa vídeo e chama callback em hosts da lista de permissão.
- **Cartão**: o back nunca vê número nem CVV (tokenização direta no gateway com chave pública).
- **Segredos**: só por variável de ambiente; nenhum segredo no repositório; em `NODE_ENV=production` o back recusa os valores de exemplo (`troque...`).
- **Logs**: pino com redação de cabeçalhos de autenticação, cookies, senhas e tokens.

## Limitações conhecidas

- **Gateway, SMTP e verificador de publicação são simulados.** Nada de dinheiro, e-mail ou rede social reais.
- **Docker/compose não foi executado** aqui; MySQL real também não (usado MariaDB 10.11). As migrações em `back/prisma/migrations` foram geradas por script a partir do schema porque o motor do Prisma não pôde ser baixado; em uma máquina com rede, confira com `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` (deve sair vazio). Isso não foi executado.
- **IA**: sem `ANTHROPIC_API_KEY`, o video-ai usa o analisador determinístico (duração, formato, qualidade técnica, áudio) e marca "conferir manualmente" os itens que dependem do conteúdo. O caminho com LLM **não foi testado** contra a API real.
- **Esqueci minha senha** só exibe aviso (o protótipo não define o fluxo). Sem estorno, disputa ou cancelamento de contrato.
- **Rate limit atrás do BFF**: coloque um proxy reverso que repasse `X-Forwarded-For` e mantenha o back em rede interna (ver `docs/ESCOPO.md`, decisão 29).
- O front não tem suíte unitária de componentes; a cobertura é o E2E e a verificação de tipos.
- Acessibilidade: rótulos, foco visível, `aria-live` e navegação por teclado foram tratados e conferidos nas capturas, mas não houve auditoria com leitor de tela.

## Dados e privacidade

Os dados de exemplo (nomes, e-mails `@email.com`, `.com.br` fictícios) vêm do protótipo. O `email-sim` guarda os e-mails só localmente. Não há envio de dados a serviços de terceiros, salvo a chamada opcional da `ANTHROPIC_API_KEY` no video-ai, se você a configurar.
