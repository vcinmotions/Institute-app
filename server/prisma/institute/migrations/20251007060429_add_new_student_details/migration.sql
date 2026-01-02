/*
  Warnings:

  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.
  - Added the required column `dob` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentsContact` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "address",
ADD COLUMN     "dob" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "parentsContact" TEXT NOT NULL,
ADD COLUMN     "permenantAddress" TEXT,
ADD COLUMN     "residentialAddress" TEXT;
