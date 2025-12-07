FROM node:18-alpine AS builder

# Установка PNPM
RUN npm install -g pnpm

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Устанавливаем зависимости через PNPM
RUN pnpm install --frozen-lockfile

# Генерируем Prisma Client
RUN pnpm prisma generate

# Копируем остальной код
COPY . .

# Собираем приложение
RUN pnpm run build

# --- Production stage ---
FROM node:18-alpine

# Установка PNPM
RUN npm install -g pnpm

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Устанавливаем только production зависимости
RUN pnpm install --prod --frozen-lockfile

# Генерируем Prisma Client
RUN pnpm prisma generate

# Копируем собранный код
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Запускаем миграции и приложение
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]
