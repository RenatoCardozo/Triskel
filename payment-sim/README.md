# payment-sim · gateway de pagamento simulado

Simula o que a Triskel precisa de um gateway: **Pix** (copia e cola, QR e expiração), **cartão** (tokenização no navegador, 3-D Secure e recusas), **saque por Pix** e **webhooks assinados** com retentativas. Tem um painel web para você fazer o papel do banco. **Nenhum valor real é movimentado.**

Armazenamento próprio em SQLite (`node:sqlite`, Node 22.5+), separado do banco do back. Não guarda número de cartão nem CVV: só marca, final, validade e a regra de teste.

## Como rodar

```bash
cp .env.example .env     # ajuste as chaves e o WEBHOOK_SECRET (igual ao PAYMENT_WEBHOOK_SECRET do back)
npm install
npm run dev              # http://localhost:4100  (painel na raiz)
npm test                 # 18 testes (cartões, 3DS, Pix/CRC16, idempotência, payout, HMAC, backoff)
```

Com Docker: `docker build -t triskel-payment-sim . && docker run -p 4100:4100 --env-file .env -v psim-data:/app/data triskel-payment-sim` (ou pelo `docker-compose.yml` da raiz).

## Chaves (três níveis)

| Chave | Quem usa | Para quê |
|---|---|---|
| `PAYSIM_PUBLIC_KEY` | navegador | só `POST /v1/tokens` (CORS restrito a `CORS_ORIGINS`) |
| `PAYSIM_API_KEY` | back da Triskel | cobranças e saques (`Authorization: Bearer`) |
| `PAYSIM_ADMIN_KEY` | você, no painel | aprovar/recusar/expirar e reenviar webhooks (`X-Admin-Key`) |

## API

- `POST /v1/tokens` (chave pública). Cartão novo: `{number, exp:"MM/AA", cvv, holder, document, type:"credito"|"debito"}`. Cartão salvo: `{cardRef, cvv}`. Devolve `{token, brand, last4, exp, type}`; o token vale 10 min e **uma** utilização. Erros de campo vêm em `error.fields` (`num`, `val`, `cvv`, `nome`, `doc`).
- `POST /v1/charges` (chave secreta) `{amountCents, method:"pix"|"card", externalRef, cardToken?, saveCard?, expectCardRef?}`. **Idempotente por `externalRef`** (mesma referência com dados diferentes = 409). Resposta: `{id, status: pending|paid|failed|expired|requires_action, pix?, card?, action?, failure?}`.
- `GET /v1/charges/:id`; `POST /v1/charges/:id/3ds {code}` (código `123456`, 3 tentativas; a 3ª errada bloqueia com código `57`).
- `POST /v1/payouts {amountCents, pixKey, externalRef}`: idempotente; a chave é guardada só mascarada. Conclui sozinho após `PAYOUT_DELAY_MS` (ou espera o painel com `PAYOUT_AUTO=false`).
- `GET /admin/overview`, `POST /admin/charges/:id/{pay|decline|expire}`, `POST /admin/payouts/:id/{complete|fail}`, `POST /admin/events/:id/retry`.

## Cartões de teste (o último bloco define o resultado)

| Número | Resultado |
|---|---|
| `4111 1111 1111 1111` / `5555 5555 5555 4444` | aprovado |
| `4000 0000 0000 3220` | pede 3-D Secure (código `123456`) |
| `4000 0000 0000 0002` | recusado pelo banco (05) |
| `4000 0000 0000 9995` | saldo ou limite insuficiente (51) |
| `4000 0000 0000 0069` | cartão vencido (54) |
| `4000 0000 0000 0127` | CVV incorreto (N7) |

Use validade futura e qualquer CVV (3 dígitos; 4 na Amex). CPF/CNPJ do titular precisam ser válidos.

## Pix

O código copia e cola é um BR Code com CRC16 válido; o QR é gerado a partir dele. Expira em `PIX_TTL_SECONDS` (600). Para pagar: abra o painel (`/`), entre com a chave de administração e use **Pagar** (ou **Expirar**/**Recusar**). `PIX_AUTOPAY_SECONDS>0` paga sozinho (útil em demonstrações e testes automáticos).

## Webhooks

`POST WEBHOOK_URL` com `{id, type, created, data}` e os cabeçalhos:

- `X-Triskel-Timestamp` (segundos), `X-Triskel-Event-Id`
- `X-Triskel-Signature: sha256=` + `HMAC_SHA256(WEBHOOK_SECRET, timestamp + "." + corpoBruto)`

Eventos: `charge.paid`, `charge.failed`, `charge.expired`, `payout.completed`, `payout.failed`. Quem recebe deve validar a assinatura, rejeitar timestamp fora de 5 min e deduplicar por `X-Triskel-Event-Id`. Falhou (HTTP ≠ 2xx ou timeout)? Retenta com backoff exponencial (1 s, 2 s, 4 s, 8 s, 16 s) e desiste na 6ª tentativa; o painel permite reenviar.

## Limitações

Simulador: sem antifraude, sem conciliação, sem estorno, sem parcelamento. Não use chaves reais, números de cartão reais nem em produção.
