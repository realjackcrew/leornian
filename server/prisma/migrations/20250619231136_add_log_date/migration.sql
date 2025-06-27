/*
  Warnings:

  - You are about to drop the column `dietSummary` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `focusScore` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `hrv` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `screenTime` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `sleepHours` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `strain` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,date]` on the table `DailyLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `DailyLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "dietSummary",
DROP COLUMN "focusScore",
DROP COLUMN "hrv",
DROP COLUMN "notes",
DROP COLUMN "screenTime",
DROP COLUMN "sleepHours",
DROP COLUMN "strain",
ADD COLUMN     "date" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "settings";

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");
