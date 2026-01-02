/*
  Warnings:

  - Added the required column `userId` to the `TaskLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskLog" ADD CONSTRAINT "TaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
