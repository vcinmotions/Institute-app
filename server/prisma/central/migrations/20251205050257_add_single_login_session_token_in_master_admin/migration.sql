-- AlterTable
ALTER TABLE "public"."SuperAdmin" ADD COLUMN     "currentSessionToken" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);
