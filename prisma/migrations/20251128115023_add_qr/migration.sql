-- CreateEnum
CREATE TYPE "qr_status" AS ENUM ('PENDING', 'SUCCESS', 'REJECT');

-- CreateTable
CREATE TABLE "qr_code_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expired" TIMESTAMP(3) NOT NULL,
    "status" "qr_status" NOT NULL DEFAULT 'PENDING',
    "user_agent" TEXT NOT NULL,

    CONSTRAINT "qr_code_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_sessions_user_agent_key" ON "qr_code_sessions"("user_agent");
