-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN     "currentSessionToken" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."RoleUser" ADD COLUMN     "currentSessionToken" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);
