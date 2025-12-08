FROM node:23 AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

COPY . .

RUN pnpm run build
FROM node:23

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN npm install -g prisma

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "prisma migrate deploy && node dist/main"]
