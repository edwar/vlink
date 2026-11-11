-- Marca "Agenda creada con VLink" y aviso de donación
ALTER TABLE "organization" ADD COLUMN "brandingRemovedUntil" TIMESTAMP(3),
ADD COLUMN "brandingUpdatedAt" TIMESTAMP(3),
ADD COLUMN "brandingUpdatedBy" TEXT;

ALTER TABLE "profile" ADD COLUMN "brandingRemovedUntil" TIMESTAMP(3),
ADD COLUMN "brandingUpdatedAt" TIMESTAMP(3),
ADD COLUMN "brandingUpdatedBy" TEXT,
ADD COLUMN "donationMilestoneSeen" INTEGER NOT NULL DEFAULT 0;
