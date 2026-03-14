-- CreateTable
CREATE TABLE "tour_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tourVersion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_progress_userId_pageKey_key" ON "tour_progress"("userId", "pageKey");

-- AddForeignKey
ALTER TABLE "tour_progress" ADD CONSTRAINT "tour_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
