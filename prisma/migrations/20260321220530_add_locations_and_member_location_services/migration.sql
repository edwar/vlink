/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "paymentReference" TEXT;

-- AlterTable
ALTER TABLE "availability" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "wompiSubaccountId" TEXT;

-- AlterTable
ALTER TABLE "plan_config" ADD COLUMN     "maxLocations" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "bufferTime" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "system_config" ADD COLUMN     "wompiMarketplaceEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_location_service" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_location_service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_organizationId_name_key" ON "location"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "member_location_service_memberId_locationId_serviceId_key" ON "member_location_service"("memberId", "locationId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_paymentReference_key" ON "appointment"("paymentReference");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_location_service" ADD CONSTRAINT "member_location_service_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_location_service" ADD CONSTRAINT "member_location_service_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_location_service" ADD CONSTRAINT "member_location_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
