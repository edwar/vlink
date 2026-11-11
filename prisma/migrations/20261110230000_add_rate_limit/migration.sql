-- Create RateLimit table
CREATE TABLE "rate_limit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "rate_limit_windowStart_idx" ON "rate_limit"("windowStart");
