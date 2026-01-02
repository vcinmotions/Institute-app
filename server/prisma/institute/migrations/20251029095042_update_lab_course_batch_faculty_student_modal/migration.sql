/*
  Warnings:

  - You are about to drop the column `courseId` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `timePerDay` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the `TeachingSchedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientAdminId` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labTimeSlotId` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Batch" DROP CONSTRAINT "Batch_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Faculty" DROP CONSTRAINT "Faculty_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeachingSchedule" DROP CONSTRAINT "TeachingSchedule_courseId_fkey";

-- AlterTable
ALTER TABLE "public"."Batch" DROP COLUMN "courseId",
DROP COLUMN "days",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "clientAdminId" TEXT NOT NULL,
ADD COLUMN     "labTimeSlotId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "timePerDay";

-- AlterTable
ALTER TABLE "public"."Faculty" DROP COLUMN "courseId";

-- AlterTable
ALTER TABLE "public"."StudentCourse" ADD COLUMN     "pcNumber" INTEGER;

-- DropTable
DROP TABLE "public"."TeachingSchedule";

-- CreateTable
CREATE TABLE "public"."BatchCourse" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "facultyId" INTEGER,
    "pcsReserved" INTEGER DEFAULT 0,

    CONSTRAINT "BatchCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchCourse_batchId_courseId_key" ON "public"."BatchCourse"("batchId", "courseId");

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_labTimeSlotId_fkey" FOREIGN KEY ("labTimeSlotId") REFERENCES "public"."LabTimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchCourse" ADD CONSTRAINT "BatchCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchCourse" ADD CONSTRAINT "BatchCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BatchCourse" ADD CONSTRAINT "BatchCourse_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
