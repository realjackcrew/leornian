/*
  Warnings:

  - You are about to drop the column `whoopCredentials` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "whoopCredentials",
ADD COLUMN     "whoopAccessToken" TEXT,
ADD COLUMN     "whoopRefreshToken" TEXT,
ADD COLUMN     "whoopTokenExpiresAt" TIMESTAMP(3);
