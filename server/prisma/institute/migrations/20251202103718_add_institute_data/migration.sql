/*
  Warnings:

  - Added the required column `fullAddress` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ClientAdmin" ADD COLUMN     "certificateName" TEXT,
ADD COLUMN     "fullAddress" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT NOT NULL,
ADD COLUMN     "sign" TEXT,
ADD COLUMN     "stamp" TEXT;
