/*
  Warnings:

  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expires_at` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `refresh_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `refresh_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `token` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "refresh_tokens_user_id_key";

-- DropIndex
DROP INDEX "refresh_tokens_uuid_idx";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
DROP COLUMN "expires_at",
DROP COLUMN "revoked",
DROP COLUMN "uuid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "user_agent" TEXT,
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");
