# Triskel · front

Aplicação web (Next.js 15, App Router, TypeScript, Tailwind v4). Implementa **somente** as telas e regras do protótipo navegável (`reference/triskel_prototipo.html`); o que não está lá fica em `docs/ESCOPO.md`, seção "Fora do escopo".

## Como rodar

```bash
cp .env.example .env.local     # ajuste BACK_URL se o back não estiver em :4000
npm ci
npm run dev                    # http://localhost:3000
# produção
npm run build && npm start
```

Requer o `back` no ar (e, para o fluxo completo, `payment-sim`, `email-sim` e `video-ai`). O `docker-compose.yml` da raiz sobe tudo.

Scripts: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `lint` (igual ao typecheck).

## Variáveis de ambiente

| Variável | Onde é lida | Para quê |
|---|---|---|
| `BACK_URL` | servidor (BFF) | URL do back vista pelo servidor do front |
| `APP_ORIGINS` | servidor | origens extras aceitas em requisições que alteram dados (anti-CSRF) |
| `COOKIE_SECURE` | servidor | `true` em HTTPS; `false` em `http://localhost` |
| `NEXT_PUBLIC_PAYSIM_URL` / `NEXT_PUBLIC_PAYSIM_PK` | navegador | tokenização do cartão no payment-sim com a chave **pública** |
| `NEXT_PUBLIC_EMAILSIM_URL` | navegador | link "Abrir meu e-mail" (só demonstração) |

`NEXT_PUBLIC_*` é embutido no bundle em build time (no Docker, são `build args`).

## Arquitetura

- **BFF com cookies httpOnly.** O navegador nunca vê tokens. `POST /api/auth/login|register|logout` falam com o back e gravam `tk_at` (acesso, curto), `tk_rt` (refresh, só no caminho `/api`) e `tk_session` (papel, para o middleware). "Lembrar-me" decide entre cookie persistente (14 dias) e de sessão.
- **Proxy `/api/bff/*`.** Repassa ao back só prefixos permitidos (lista fechada), checa `Origin` em métodos que alteram dados, renova o token de forma serializada (uma renovação por refresh token) e repete a requisição. Envio de vídeo/foto passa em stream.
- **`middleware.ts`.** Redireciona não autenticados para `/login?next=`, bloqueia rotas por papel (Criador / Comércio / Agência) e define a CSP com nonce por requisição.
- **Dados.** TanStack Query; formulários com react-hook-form + zod; máscaras de CPF, CNPJ, telefone, data, cartão e R$ (valores em centavos).
- **Interface.** Desktop com menu lateral; celular com cabeçalho e barra inferior (Painel, Buscar, Contatos, Entregas, Mais). Estados de carregando, erro e vazio em toda lista; foco visível, rótulos, `aria-live`, link "pular para o conteúdo". Tema claro/escuro em Configurações (inversão de cores, como no protótipo).
- **Fontes** locais (`@fontsource-variable/inter`), sem chamadas a terceiros.

## Estrutura

```
src/app/(public)   home, login, cadastro, notícias, empresa, fale conosco, privacidade, termos
src/app/(app)      painel, perfil, oportunidades, criadores, campanhas, contatos, contratos, entregas, pagamentos, avaliações, clientes, ajuda, configurações
src/app/api        BFF (auth e proxy) e /api/health
src/components     UI base, formulários, shell, blocos de domínio
src/lib            api client, máscaras, schemas, tipos, helpers de servidor
```

## Limitações

- Esqueci a senha só exibe um aviso (o protótipo não define o fluxo de redefinição).
- Atrás de proxy reverso, repasse `X-Forwarded-For`; sem ele, o limite de tentativas de login do back enxerga o IP do próprio front.
- Testes automatizados do front: verificação de tipos e roteiro Playwright manual (ver README da raiz); não há suíte unitária de componentes.
