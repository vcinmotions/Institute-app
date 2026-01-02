/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FeeStructure" ADD COLUMN     "studentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_studentId_courseId_key" ON "public"."FeeStructure"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
