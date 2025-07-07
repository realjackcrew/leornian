-- AlterTable
ALTER TABLE "User" ADD COLUMN     "settings" JSONB;

-- CreateTable
CREATE TABLE "DatapointPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "datapoint" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatapointPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatapointPreference_userId_category_datapoint_key" ON "DatapointPreference"("userId", "category", "datapoint");

-- AddForeignKey
ALTER TABLE "DatapointPreference" ADD CONSTRAINT "DatapointPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
