# back · API da Triskel
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json ./
COPY src ./src
# Gera o cliente Prisma (o gerador "prisma-client" não usa o motor de consulta; precisa de rede só para o CLI) e compila.
RUN npx prisma generate && npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/uploads && chown app:app /app/uploads
# node_modules completo: o seed de demonstração usa tsx. Para uma imagem enxuta, remova o seed e use `npm prune --omit=dev`.
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/src/generated ./src/generated
COPY --chown=app:app package.json tsconfig.json prisma.config.ts ./
COPY --chown=app:app prisma ./prisma
COPY --chown=app:app src ./src
COPY --chown=app:app scripts ./scripts
USER app
VOLUME ["/app/uploads"]
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s CMD wget -qO- http://127.0.0.1:4000/health || exit 1
ENTRYPOINT ["sh", "scripts/entrypoint.sh"]
