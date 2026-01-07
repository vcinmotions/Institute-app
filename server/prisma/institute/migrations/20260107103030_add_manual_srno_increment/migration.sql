-- AlterTable
ALTER TABLE "public"."Enquiry" ALTER COLUMN "srNo" DROP DEFAULT;
DROP SEQUENCE "Enquiry_srNo_seq";
