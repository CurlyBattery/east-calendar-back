/*
  Warnings:

  - You are about to drop the column `decsription` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "task_types" AS ENUM ('PERSONAL', 'TEAM', 'COMPANY');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "decsription",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "type" "task_types" NOT NULL DEFAULT 'PERSONAL';
