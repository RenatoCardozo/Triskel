# Publicar a demonstração (Render + Aiven, planos gratuitos)

Este roteiro coloca os 5 serviços online usando o `render.yaml` da raiz. É uma **demonstração**: pagamento, e-mail e publicação são simulados.
O `render.yaml` e as mudanças de e-mail por HTTP e de TLS no banco **não foram executados no Render** por quem os escreveu; o e-mail por HTTP foi testado localmente (back → email-sim, com anexo), o resto não. Se algo falhar, veja "Problemas comuns".

## 1. Banco MySQL gratuito (Aiven)

Não use TiDB: as migrações criam *triggers* (livro-razão imutável) e o TiDB não os suporta.

1. Crie uma conta em https://aiven.io (não pede cartão no plano gratuito).
2. Crie um serviço **MySQL** e escolha o plano **Free**. Espere ficar "Running".
3. Copie o **Service URI**, no formato `mysql://avnadmin:SENHA@HOST:PORTA/defaultdb?ssl-mode=REQUIRED`. Você vai colá-lo no Render.

Limites: 1 GB de disco. A Aiven pode **desligar o serviço por inatividade** (você religa no painel). Quando o banco está desligado, o back não sobe.

## 2. Render

1. Crie uma conta em https://render.com e entre com o GitHub (autorize o acesso ao repositório `Triskel`).
2. **New → Blueprint**, escolha o repositório `Triskel`, branch `main`. O Render lê o `render.yaml` e lista os 5 serviços.
3. Ele pede dois valores:
   - `DATABASE_URL`: o Service URI da Aiven.
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
- Planos e limites mudam; confirme em https://render.com/pricing e https://aiven.io/docs/products/mysql/concepts/mysql-free-tier.

## Problemas comuns

| Sintoma | O que verificar |
|---|---|
| `triskel-rc-api` falha ao subir, log com "Banco indisponível" | `DATABASE_URL` incorreta, ou serviço da Aiven desligado/ainda iniciando. |
| Log da migração com "SUPER privilege and binary logging" | O usuário da Aiven não pode criar *triggers* com o log binário ligado. Procure na configuração avançada do serviço MySQL a opção `log_bin_trust_function_creators` e ative; se não existir, veja o plano de contingência abaixo. |
| Erro de certificado ao conectar | Defina no back `DATABASE_CA_CERT` com o certificado da CA do serviço (aba "Overview" da Aiven). Sem ele, a conexão só é criptografada, sem verificar o servidor. |
| O cartão ou o link da caixa de e-mail apontam para `localhost` | O Render não passou as variáveis `NEXT_PUBLIC_*` ao build do front. Rode "Clear build cache & deploy" no `triskel-rc-web`; se continuar, avise. |
| Login funciona e logo depois volta à tela de login | Confira `COOKIE_SECURE=true` e `APP_ORIGINS` com a URL exata do front. |
| Pix nunca confirma | `triskel-rc-pay` precisa acordar e chamar `https://triskel-rc-api.onrender.com/webhooks/payments`; confira `WEBHOOK_URL` e se o nome do serviço da API mudou. |

**Contingência para triggers:** sem *triggers* a demonstração funciona, mas o livro-razão deixa de ser protegido no banco (a imutabilidade passa a depender só do código). Isso é uma troca de segurança que você precisa decidir antes de remover a migração `20261106000100_ledger_immutable`.
