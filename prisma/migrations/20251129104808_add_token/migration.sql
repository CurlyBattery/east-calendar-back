/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `qr_code_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "qr_code_sessions" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_sessions_token_key" ON "qr_code_sessions"("token");

-- AddForeignKey
ALTER TABLE "qr_code_sessions" ADD CONSTRAINT "qr_code_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
