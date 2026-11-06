# Publicar a demonstração (Render + banco gratuito)

Este roteiro coloca os 5 serviços online usando o `render.yaml` da raiz. É uma **demonstração**: pagamento, e-mail e publicação são simulados.
O `render.yaml` e as mudanças de e-mail por HTTP e de TLS no banco **não foram executados no Render** por quem os escreveu; o e-mail por HTTP foi testado localmente (back → email-sim, com anexo), o resto não. Se algo falhar, veja "Problemas comuns".

## 1. Banco MySQL/MariaDB gratuito

Precisa ser MySQL ou MariaDB **com suporte a triggers** (as migrações criam 2, para o livro-razão imutável) e **acesso remoto**. Não serve TiDB (sem triggers) nem Postgres.

O banco ocupa pouco: medido localmente em MariaDB 10.11, as migrações e os dados de exemplo ocupam cerca de **1,2 MB** (26 tabelas), dentro dos limites de 10 MB dos planos gratuitos. As migrações, os 2 triggers e o seed foram aplicados com sucesso em MariaDB 10.11.

**Opção recomendada: Filess.io** (https://filess.io). Plano Free: 2 bancos de 10 MB cada, sem cartão e sem prazo, segundo a página do provedor.
1. Crie a conta e um banco **MariaDB** (ou MySQL) no plano Free.
2. Anote os dados de conexão que o provedor mostra: host, porta, usuário, senha e nome do banco.
3. Monte a `DATABASE_URL`: `mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO`. Se a senha tiver símbolos (`@ : / # ? %`), troque cada um pelo código `%XX` (por exemplo `@` vira `%40`).

**Alternativa: Clever Cloud**, plano DEV do MySQL (gratuito, "somente para testes", sem backup). A página do provedor não informa o tamanho nem o limite de conexões, então confira no painel.

Não consegui conferir, nas páginas dos provedores, se o plano gratuito aceita **triggers**, quantas **conexões** permite e se exige **TLS**. Isso só aparece na primeira subida da API:
- o Render passa `DATABASE_POOL_SIZE=3` (poucas conexões) e `DATABASE_SSL=true` (criptografa);
- se o log disser que o servidor não aceita conexão segura, mude `DATABASE_SSL` para `false` no `triskel-rc-api`;
- se disser "too many connections", diminua `DATABASE_POOL_SIZE` para 2;
- se recusar os triggers, veja a contingência no fim deste arquivo.

Planos gratuitos de banco podem pausar ou apagar bancos sem uso; confira as regras do provedor.

## 2. Render

1. Crie uma conta em https://render.com e entre com o GitHub (autorize o acesso ao repositório `Triskel`).
2. **New → Blueprint**, escolha o repositório `Triskel`, branch `main`. O Render lê o `render.yaml` e lista os 5 serviços.
3. Ele pede dois valores:
   - `DATABASE_URL`: a URL montada no passo 1.
   - `SEED_PASSWORD`: a senha dos usuários de demonstração. Use uma senha forte, com no mínimo 8 caracteres (o login recusa menos que isso), por exemplo `Demo@Triskel26`. Qualquer pessoa com ela entra nas contas de exemplo, então não reutilize uma senha sua.
4. Confirme e espere. O primeiro build leva de 10 a 20 minutos (o `front` e o `video-ai` demoram mais).
5. Abra `https://triskel-rc-web.onrender.com`.

Nomes de serviço são únicos no Render inteiro. Se o Blueprint avisar que algum nome está em uso, troque o prefixo `triskel-rc-` por outro **em todo o `render.yaml`** e aplique de novo.

## 3. Usar a demonstração

- Entre com `marjorie@email.com` (criadora), `contato@docevale.com.br` (comércio) ou `oi@maredigital.com.br` (agência), com a senha do `SEED_PASSWORD`.
- Cadastro novo: o código de verificação chega na caixa de e-mail simulada (`https://triskel-rc-mail.onrender.com`). Ela pede uma chave: no Render, abra o serviço `triskel-rc-mail` → **Environment** → `EMAILSIM_API_KEY`.
- Pix: o gateway simulado "paga" o Pix sozinho em cerca de 8 segundos (`PIX_AUTOPAY_SECONDS`). O painel do gateway fica em `https://triskel-rc-pay.onrender.com` e pede `PAYSIM_ADMIN_KEY` (serviço `triskel-rc-pay` → Environment).

## Limitações do plano gratuito

- Cada serviço **dorme após cerca de 15 minutos sem acesso**. O primeiro acesso depois disso leva cerca de 1 minuto, e a cadeia de serviços (front → API → pagamento/e-mail/IA) pode precisar acordar em sequência.
- Os arquivos locais **somem quando o serviço reinicia**: vídeos e imagens enviados (API), e os bancos do pagamento, do e-mail e do vídeo (SQLite). O banco principal (MySQL) persiste. Depois de um reinício, registros antigos podem apontar para arquivos que não existem mais.
- Tarefas em segundo plano da API (por exemplo a confirmação simulada de publicação) não rodam enquanto o serviço está dormindo.
- O limite de tentativas de login é por IP; confira a decisão 29 em `ESCOPO.md`.
- A caixa de e-mail e o painel do pagamento são simulações e ficam protegidos por chave. Não coloque dados reais.
- Planos e limites mudam; confirme em https://render.com/pricing e no site do provedor do banco.

## Problemas comuns

| Sintoma | O que verificar |
|---|---|
| `triskel-rc-api` falha ao subir, log com "Banco indisponível" | `DATABASE_URL` incorreta (senha com símbolo sem `%XX`?), banco pausado ou porta errada. |
| Log com "secure connection" / SSL | O provedor não aceita TLS: `DATABASE_SSL=false`. |
| Log com "too many connections" | Diminua `DATABASE_POOL_SIZE` (já está em 3). |
| Log da migração com "SUPER privilege", "TRIGGER" ou "binary logging" | O plano gratuito não deixa criar *triggers*. Tente outro provedor; se nenhum aceitar, veja a contingência abaixo. |
| Erro de certificado ao conectar | Defina no back `DATABASE_CA_CERT` com o certificado da CA do serviço (o provedor costuma oferecê-lo para download). Sem ele, a conexão só é criptografada, sem verificar o servidor. |
| O cartão ou o link da caixa de e-mail apontam para `localhost` | O Render não passou as variáveis `NEXT_PUBLIC_*` ao build do front. Rode "Clear build cache & deploy" no `triskel-rc-web`; se continuar, avise. |
| Login funciona e logo depois volta à tela de login | Confira `COOKIE_SECURE=true` e `APP_ORIGINS` com a URL exata do front. |
| Pix nunca confirma | `triskel-rc-pay` precisa acordar e chamar `https://triskel-rc-api.onrender.com/webhooks/payments`; confira `WEBHOOK_URL` e se o nome do serviço da API mudou. |

**Contingência para triggers:** sem *triggers* a demonstração funciona, mas o livro-razão deixa de ser protegido no banco (a imutabilidade passa a depender só do código). Isso é uma troca de segurança que você precisa decidir antes de remover a migração `20261106000100_ledger_immutable`.
