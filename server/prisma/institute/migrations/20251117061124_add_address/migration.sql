/*
  Warnings:

  - Added the required column `city` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Enquiry_email_key";

-- AlterTable
ALTER TABLE "public"."ClientAdmin" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
