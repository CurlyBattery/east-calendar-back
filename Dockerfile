FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем остальной код
COPY . .

# Собираем приложение
RUN npm run build

# --- Production stage ---
FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Генерируем Prisma Client для production
RUN npx prisma generate

# Копируем собранный код
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Запускаем миграции и приложение
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
