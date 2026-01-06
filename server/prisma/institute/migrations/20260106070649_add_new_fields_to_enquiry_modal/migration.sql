-- AlterTable
ALTER TABLE "public"."Enquiry" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "alternateContact" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "referedBy" TEXT;
