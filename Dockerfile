# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # compila TS -> dist/

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Se usa Drizzle, copie as migrações (pasta 'drizzle') geradas no repo:
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000
CMD ["node", "dist/server.js"]  # ajuste se seu entrypoint for outro (ex.: dist/main.js)
