/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Student` table. All the data in the column will be lost.
  - Added the required column `contact` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Faculty" DROP COLUMN "contactNumber",
ADD COLUMN     "contact" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "contactNumber",
ADD COLUMN     "contact" TEXT NOT NULL;
