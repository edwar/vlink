/*
  Warnings:

  - The values [FREE] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('BASIC', 'TEAM', 'CORPORATE');
ALTER TABLE "public"."organization" ALTER COLUMN "subscriptionPlan" DROP DEFAULT;
ALTER TABLE "organization" ALTER COLUMN "subscriptionPlan" TYPE "SubscriptionPlan_new" USING ("subscriptionPlan"::text::"SubscriptionPlan_new");
ALTER TABLE "plan_config" ALTER COLUMN "id" TYPE "SubscriptionPlan_new" USING ("id"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "organization" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'BASIC';
COMMIT;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'BASIC';
