/*
  Warnings:

  - Added the required column `clientAdminId` to the `EnquiryCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."EnquiryCourse" ADD COLUMN     "clientAdminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."EnquiryCourse" ADD CONSTRAINT "EnquiryCourse_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
