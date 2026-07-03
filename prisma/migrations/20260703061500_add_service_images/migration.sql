-- Create ServiceImage table
CREATE TABLE "service_image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "service_image_pkey" PRIMARY KEY ("id")
);

-- Add index on (serviceId, order)
CREATE INDEX "service_image_serviceId_order_idx" ON "service_image"("serviceId", "order");

-- Add foreign key
ALTER TABLE "service_image" ADD CONSTRAINT "service_image_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop imageUrl column from service table (no data to migrate)
ALTER TABLE "service" DROP COLUMN IF EXISTS "imageUrl";
