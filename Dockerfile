FROM node:18-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# Генерация клиента
RUN pnpm exec prisma generate

COPY . .

RUN pnpm run build


# --- Production stage ---
FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node dist/main"]
