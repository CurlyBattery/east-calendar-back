/*
  Warnings:

  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "plan";

-- CreateTable
CREATE TABLE "is_subscription_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionPlan" "subscription_plans" NOT NULL DEFAULT 'FREE',
    "isExpired" TIMESTAMP(3),

    CONSTRAINT "is_subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "is_subscription_plans_userId_key" ON "is_subscription_plans"("userId");

-- AddForeignKey
ALTER TABLE "is_subscription_plans" ADD CONSTRAINT "is_subscription_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
