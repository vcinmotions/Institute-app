/*
  Warnings:

  - Added the required column `contact` to the `Enquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course` to the `Enquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Enquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Enquiry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "public"."FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED');

-- AlterTable
ALTER TABLE "public"."Enquiry" ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "course" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isConverted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadStatus" "public"."LeadStatus" NOT NULL DEFAULT 'WARM',
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."FollowUp" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpStatus" "public"."FollowUpStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FollowUp" ADD CONSTRAINT "FollowUp_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "public"."Enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
