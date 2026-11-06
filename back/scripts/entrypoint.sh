#!/bin/sh
# Container do back: aplica as migrações, opcionalmente roda o seed (só em banco vazio) e inicia a API.
set -e
i=0
until node scripts/apply-migrations.mjs; do
  i=$((i+1))
  if [ "$i" -ge 30 ]; then echo "Banco indisponível depois de 30 tentativas." >&2; exit 1; fi
  echo "Aguardando o banco ($i/30)..."; sleep 2
done
if [ "${SEED_ON_START:-false}" = "true" ]; then
  node_modules/.bin/tsx prisma/seed.ts
fi
exec node --enable-source-maps dist/server.js
