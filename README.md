# EastCalendar Back

## Installation
### dependency
```bash
pnpm i
```

### copy .env
```bash
copy .env.example .env
```

## DB
### start db
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### stop db
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Prisma
### run migration
```bash
npx prisma migrate dev
```

### run generate
```bash
npx prisma generate
```

### reset prisma 
```bash
npx prisma migrate reset
```

## App
### start app
```bash
pnpm run start:dev
```
