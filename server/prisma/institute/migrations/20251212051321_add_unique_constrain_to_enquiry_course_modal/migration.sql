/*
  Warnings:

  - A unique constraint covering the columns `[enquiryId,courseId]` on the table `EnquiryCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EnquiryCourse_enquiryId_courseId_key" ON "public"."EnquiryCourse"("enquiryId", "courseId");
