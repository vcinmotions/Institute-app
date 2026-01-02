/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientAdminId` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Faculty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Faculty" DROP CONSTRAINT "Faculty_courseId_fkey";

-- DropIndex
DROP INDEX "public"."Faculty_courseId_key";

-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN     "clientAdminId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'FACULTY',
ADD COLUMN     "specialization" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."RoleUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "RoleUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleUser_email_key" ON "public"."RoleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "public"."Faculty"("email");

-- AddForeignKey
ALTER TABLE "public"."RoleUser" ADD CONSTRAINT "RoleUser_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Faculty" ADD CONSTRAINT "Faculty_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Faculty" ADD CONSTRAINT "Faculty_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
