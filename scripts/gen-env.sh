#!/bin/sh
# Gera o .env da raiz com segredos aleatórios (não sobrescreve um .env existente).
set -e
cd "$(dirname "$0")/.."
[ -e .env ] && { echo ".env já existe; nada a fazer." >&2; exit 0; }
r() { node -e "console.log(require('crypto').randomBytes($1).toString('base64url'))"; }
sed \
  -e "s|^MYSQL_PASSWORD=.*|MYSQL_PASSWORD=$(r 18)|" \
  -e "s|^MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$(r 18)|" \
  -e "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$(r 48)|" \
  -e "s|^CODE_PEPPER=.*|CODE_PEPPER=$(r 24)|" \
  -e "s|^FILE_TOKEN_SECRET=.*|FILE_TOKEN_SECRET=$(r 24)|" \
  -e "s|^PAYSIM_API_KEY=.*|PAYSIM_API_KEY=sk_test_$(r 24)|" \
  -e "s|^PAYSIM_PUBLIC_KEY=.*|PAYSIM_PUBLIC_KEY=pk_test_$(r 24)|" \
  -e "s|^PAYSIM_ADMIN_KEY=.*|PAYSIM_ADMIN_KEY=adm_test_$(r 24)|" \
  -e "s|^PAYMENT_WEBHOOK_SECRET=.*|PAYMENT_WEBHOOK_SECRET=$(r 48)|" \
  -e "s|^VIDEOAI_API_KEY=.*|VIDEOAI_API_KEY=$(r 24)|" \
  -e "s|^VIDEOAI_WEBHOOK_SECRET=.*|VIDEOAI_WEBHOOK_SECRET=$(r 48)|" \
  .env.example > .env
chmod 600 .env
echo ".env criado com segredos aleatórios. Suba com: docker compose up --build"
