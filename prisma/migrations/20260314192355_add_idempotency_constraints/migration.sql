/*
  Warnings:

  - The values [ADMIN] on the enum `MemberRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[cancelToken]` on the table `appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,specificDate,startTime,endTime]` on the table `availability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpCustomerId]` on the table `organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mpSubscriptionId]` on the table `organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webhookChannelId]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,name]` on the table `service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'TEAM', 'CORPORATE');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'DEGRADED');

-- AlterEnum
BEGIN;
CREATE TYPE "MemberRole_new" AS ENUM ('OWNER', 'MANAGER', 'PROFESSIONAL');
ALTER TABLE "public"."invitation" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "member" ALTER COLUMN "role" TYPE "MemberRole_new" USING ("role"::text::"MemberRole_new");
ALTER TABLE "invitation" ALTER COLUMN "role" TYPE "MemberRole_new" USING ("role"::text::"MemberRole_new");
ALTER TYPE "MemberRole" RENAME TO "MemberRole_old";
ALTER TYPE "MemberRole_new" RENAME TO "MemberRole";
DROP TYPE "public"."MemberRole_old";
ALTER TABLE "invitation" ALTER COLUMN "role" SET DEFAULT 'PROFESSIONAL';
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'PROFESSIONAL';
COMMIT;

-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "cancelToken" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reminder24hSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder2hSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "billingStatus" "BillingStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "gracePeriodEnd" TIMESTAMP(3),
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "mpCustomerId" TEXT,
ADD COLUMN     "mpSubscriptionId" TEXT,
ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "advanceNoticeHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "syncToken" TEXT,
ADD COLUMN     "webhookChannelId" TEXT,
ADD COLUMN     "webhookExpiresAt" TIMESTAMP(3),
ADD COLUMN     "webhookResourceId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "announcementTitle" TEXT,
    "announcementBody" TEXT,
    "announcementType" TEXT NOT NULL DEFAULT 'INFO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_config" (
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "limit" TEXT NOT NULL,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maxSeats" INTEGER NOT NULL DEFAULT 0,
    "id" "SubscriptionPlan" NOT NULL,

    CONSTRAINT "plan_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_cancelToken_key" ON "appointment"("cancelToken");

-- CreateIndex
CREATE INDEX "appointment_profileId_startTime_endTime_idx" ON "appointment"("profileId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "availability_profileId_specificDate_startTime_endTime_key" ON "availability"("profileId", "specificDate", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "organization_mpCustomerId_key" ON "organization"("mpCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_mpSubscriptionId_key" ON "organization"("mpSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_webhookChannelId_key" ON "profile"("webhookChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "service_profileId_name_key" ON "service"("profileId", "name");
