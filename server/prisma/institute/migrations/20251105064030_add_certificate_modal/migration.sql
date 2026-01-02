/*
  Warnings:

  - A unique constraint covering the columns `[studentCourseId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentCourseId` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Certificate" ADD COLUMN     "studentCourseId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_studentCourseId_key" ON "public"."Certificate"("studentCourseId");

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_studentCourseId_fkey" FOREIGN KEY ("studentCourseId") REFERENCES "public"."StudentCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
