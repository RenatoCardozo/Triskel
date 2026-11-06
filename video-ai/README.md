# video-ai · análise assíncrona de vídeo

Recebe um job da Triskel (vídeo ou link de post + briefing + requisitos), analisa em segundo plano e devolve o resultado por **webhook assinado**. Para cada requisito devolve `{id, status: ok | atencao | falha, evidence, suggestion}`.

## Como rodar

Precisa de Node 22.5+ e de `ffmpeg`/`ffprobe` no PATH (a imagem Docker já traz).

```bash
cp .env.example .env     # defina VIDEOAI_API_KEY e WEBHOOK_SECRET (iguais aos VIDEOAI_API_KEY / VIDEOAI_WEBHOOK_SECRET do back)
npm install
npm run dev              # http://localhost:4300
npm test                 # 11 testes, com vídeos gerados pelo próprio ffmpeg
```

## Como analisa

1. Baixa o vídeo pela URL assinada e de curta duração que o back enviou. Só baixa de hosts em `ALLOWED_FETCH_HOSTS`, não segue redirecionamentos e respeita `MAX_VIDEO_MB` (proteção contra SSRF).
2. Mede com `ffprobe`/`ffmpeg`: duração, resolução e proporção (inclui rotação), áudio presente, volume médio/pico e brilho.
3. **Itens medidos** (`dur` duração, `fmt` formato 9:16, `tec` qualidade técnica) são sempre calculados por medição, nunca por opinião de modelo.
4. **Itens de conteúdo** (logo, produto, mensagem, menções, humano em cena...):
   - **sem `ANTHROPIC_API_KEY`** (padrão): motor determinístico. O que não dá para verificar sem olhar o conteúdo vira `atencao` com "conferir manualmente". O motor nunca aprova nem reprova o que não consegue ver.
   - **com `ANTHROPIC_API_KEY`**: alguns quadros do vídeo e as medições vão para a API da Anthropic, que responde um JSON validado por schema. Se a API falhar, cai no motor determinístico e o resultado informa isso em `engine`. **Atenção: com a chave ligada, imagens do vídeo saem do seu ambiente.**
5. `ok` do resultado = nenhum requisito com status `falha`. `score` = ok 100%, atenção 60%, falha 0%.

Link de post (sem arquivo): todos os itens ficam `atencao`, porque o serviço não acessa redes sociais.

## API

Autenticação: `Authorization: Bearer <VIDEOAI_API_KEY>`.

- `POST /v1/jobs` (202) `{jobId, videoUrl | postUrl, briefing:{campaignName, brand, product, message, cta?, mentions?, avoid?, maxSeconds}, requirements:[{id,label}], callbackUrl}`. Idempotente por `jobId`.
- `GET /v1/jobs/:id`: estado do job, resultado e situação da entrega do webhook.
- `GET /health`.

## Webhook de resultado

`POST callbackUrl`, corpo `{id, type: "analysis.completed", created, data:{jobId, ok, score, summary, engine, metrics, requirements}}`.

Cabeçalhos: `X-Triskel-Timestamp`, `X-Triskel-Event-Id` (estável por job, então o receptor deduplica) e `X-Triskel-Signature: sha256=HMAC_SHA256(WEBHOOK_SECRET, timestamp + "." + corpo)`. Retentativas com espera dobrando (1, 2, 4, 8, 16 s), no máximo 6 tentativas. A fila fica em SQLite (`DB_PATH`) e sobrevive a reinício; jobs "processando" há mais de 10 min voltam para a fila.

## Limitações

- O caminho com LLM foi testado só com `fetch` simulado (formato da requisição e validação da resposta). **Não foi executado contra a API real**, por falta de chave.
- Não transcreve a fala do vídeo (menções e mensagem faladas só são conferidas pelo LLM, vendo quadros).
- Não acessa Instagram/TikTok.
