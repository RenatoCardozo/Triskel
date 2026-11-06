# email-sim · caixa de entrada de teste

Servidor **SMTP de captura** (nada sai para a internet) com **caixa de entrada web** e **API REST**. O back da Triskel envia por aqui; você lê os códigos de verificação, os avisos de proposta e os contratos em PDF anexados.

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev     # SMTP em :2525 e caixa de entrada em http://localhost:4200
npm test        # 4 testes: captura SMTP, código de 6 dígitos, anexo PDF, retenção e CSP
```

Docker: `docker build -t triskel-email-sim . && docker run -p 2525:2525 -p 4200:4200 -v esim-data:/app/data triskel-email-sim`.

## Para o back

`SMTP_HOST=email-sim` (ou `localhost`), `SMTP_PORT=2525`, sem usuário/senha e sem TLS. Aceita qualquer remetente e destinatário. Tamanho máximo `MAX_MESSAGE_MB`; guarda as últimas `KEEP_MESSAGES`.

## API REST

| Rota | O que faz |
|---|---|
| `GET /api/messages?to=&subject=&q=&limit=` | Lista (mais recentes primeiro), com `unread` e `code` (6 dígitos detectado no texto) |
| `GET /api/messages/latest?to=ana@x.com&subject=código&since=<ms>` | Mensagem mais recente (texto e HTML). Útil para testes E2E esperarem o código |
| `GET /api/messages/:id` | Mensagem completa; marca como lida; lista anexos |
| `GET /api/messages/:id/attachments/:n` | Baixa o anexo |
| `DELETE /api/messages/:id` e `DELETE /api/messages` | Apaga uma ou todas |

`EMAILSIM_API_KEY` (opcional) passa a exigir o cabeçalho `X-Api-Key` na API (a interface pede a chave). Sem ela, a caixa fica aberta: use só em ambiente local ou rede interna.

## Segurança

O HTML dos e-mails é exibido em `iframe sandbox` com CSP `default-src 'none'; sandbox` (sem scripts, sem formulários). Anexos saem como `attachment` com `nosniff`. Armazenamento próprio em SQLite.
