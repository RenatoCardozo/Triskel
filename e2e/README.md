# e2e · roteiro do fluxo completo

Playwright (via `playwright-core`, usando o Chrome instalado) contra a stack **já em execução**: front, back, payment-sim, email-sim e video-ai.

```bash
npm ci
export PAYSIM_ADMIN_KEY=...        # a mesma do payment-sim (usada para marcar o Pix como pago)
export CHROME=/usr/bin/google-chrome   # opcional
npm run e2e                        # capturas e vídeo de teste em $E2E_OUT (padrão /tmp/triskel-e2e)
```

Variáveis opcionais: `WEB_URL` (http://localhost:3000), `EMAILSIM_URL` (http://localhost:4200), `PAYSIM_URL` (http://localhost:4100).

Requisitos da stack para o roteiro: `MAIL_ENABLED=true` no back apontando para o email-sim, `JOBS_ENABLED=true`, `PUBLICATION_CHECK_DELAY_MS` baixo (2000) e `ffmpeg` no PATH (o roteiro gera o vídeo de teste). Cada execução cria usuários novos (e-mails com sufixo único), então pode rodar várias vezes no mesmo banco.

O que cobre: cadastro dos 3 perfis pela interface, código por e-mail (errado e certo), perfil completo, recarga Pix com webhook, campanha, busca com compatibilidade, proposta, bloqueio de vazamento, contraproposta, aceite, pagamento em custódia (e repetição idempotente), assinatura, PDF, vídeo, análise da IA, pedido de ajustes, reenvio, aprovação, publicação, liberação, saque (e recusa acima do saldo), agência com cliente, RBAC, CSRF por `Origin` e isolamento entre contas.

`shots.mjs` tira capturas de tela das páginas principais dos três perfis em 1280 px e 390 px e acusa erros de console, respostas >= 400 e rolagem horizontal.
