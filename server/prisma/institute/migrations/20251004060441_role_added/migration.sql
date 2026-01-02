/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `title` on the `Course` table. All the data in the column will be lost.
  - The `id` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - The `id` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[studentId]` on the table `Enquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentCode]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `durationWeeks` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentCode` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('ONE_TIME', 'INSTALLMENT');

-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'FRONT_DESK', 'FACULTY', 'ACCOUNTANT', 'VIEW_ONLY');

-- AlterTable
ALTER TABLE "public"."ClientAdmin" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "title",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationWeeks" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Enquiry" ADD COLUMN     "studentId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "idProofNumber" TEXT,
ADD COLUMN     "idProofType" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "studentCode" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."Batch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "days" TEXT NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Faculty" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentCourse" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "facultyId" INTEGER,
    "batchId" INTEGER,
    "internalNotes" TEXT,
    "status" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "StudentCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeeStructure" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentFee" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMode" "public"."PaymentMode" NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "StudentFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StationeryItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,

    CONSTRAINT "StationeryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StationeryIssue" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remarks" TEXT,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "StationeryIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttendanceRecord" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentTask" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "facultyRemarks" TEXT,
    "grade" TEXT,
    "facultyId" INTEGER,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "StudentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentTest" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "marksObtained" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "StudentTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseCompletion" (
    "id" SERIAL NOT NULL,
    "studentCourseId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "feedback" TEXT,
    "remarks" TEXT,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "CourseCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentFee_receiptNo_key" ON "public"."StudentFee"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_studentId_key" ON "public"."Enquiry"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "public"."Student"("studentCode");

-- AddForeignKey
ALTER TABLE "public"."Enquiry" ADD CONSTRAINT "Enquiry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourse" ADD CONSTRAINT "StudentCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourse" ADD CONSTRAINT "StudentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourse" ADD CONSTRAINT "StudentCourse_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourse" ADD CONSTRAINT "StudentCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourse" ADD CONSTRAINT "StudentCourse_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentFee" ADD CONSTRAINT "StudentFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentFee" ADD CONSTRAINT "StudentFee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentFee" ADD CONSTRAINT "StudentFee_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StationeryIssue" ADD CONSTRAINT "StationeryIssue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StationeryIssue" ADD CONSTRAINT "StationeryIssue_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StationeryIssue" ADD CONSTRAINT "StationeryIssue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."StationeryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StationeryIssue" ADD CONSTRAINT "StationeryIssue_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTask" ADD CONSTRAINT "StudentTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTask" ADD CONSTRAINT "StudentTask_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTask" ADD CONSTRAINT "StudentTask_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTask" ADD CONSTRAINT "StudentTask_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTest" ADD CONSTRAINT "StudentTest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTest" ADD CONSTRAINT "StudentTest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTest" ADD CONSTRAINT "StudentTest_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompletion" ADD CONSTRAINT "CourseCompletion_studentCourseId_fkey" FOREIGN KEY ("studentCourseId") REFERENCES "public"."StudentCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompletion" ADD CONSTRAINT "CourseCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseCompletion" ADD CONSTRAINT "CourseCompletion_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
