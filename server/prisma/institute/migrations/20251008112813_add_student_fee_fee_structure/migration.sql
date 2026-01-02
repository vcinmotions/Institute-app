/*
  Warnings:

  - Added the required column `studentCode` to the `StudentCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StudentCourse" ADD COLUMN     "studentCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."StudentFee" ADD CONSTRAINT "StudentFee_studentId_courseId_fkey" FOREIGN KEY ("studentId", "courseId") REFERENCES "public"."FeeStructure"("studentId", "courseId") ON DELETE RESTRICT ON UPDATE CASCADE;
