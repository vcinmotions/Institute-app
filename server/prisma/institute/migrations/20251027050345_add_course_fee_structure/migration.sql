/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Faculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN     "courseId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."CourseFeeStructure" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "installmentCount" INTEGER,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "CourseFeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeeStructure_courseId_key" ON "public"."CourseFeeStructure"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_courseId_key" ON "public"."Faculty"("courseId");

-- AddForeignKey
ALTER TABLE "public"."CourseFeeStructure" ADD CONSTRAINT "CourseFeeStructure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseFeeStructure" ADD CONSTRAINT "CourseFeeStructure_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Faculty" ADD CONSTRAINT "Faculty_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
