# ---------- builder ----------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia apenas o backend, ignora functions/
COPY src ./src
# COPY tsconfig.json ./
COPY tsconfig.deploy.json ./
# COPY .env ./
COPY drizzle.config.ts ./
COPY docker/ ./docker
# Adicione outros arquivos necessários para o backend
# Adicione outros arquivos necessários para o backend

RUN npm run build   # compila TS -> dist/

# ---------- runtime ----------
FROM node:20

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker ./docker
# COPY .env ./
# Adicione outros arquivos necessários para runtime

RUN npm ci --omit=dev

CMD ["node", "--experimental-strip-types", "--no-warnings", "dist/server.ts"]
