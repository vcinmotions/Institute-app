-- AlterTable
ALTER TABLE "public"."ClientAdmin" ADD COLUMN     "currentSessionToken" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);
