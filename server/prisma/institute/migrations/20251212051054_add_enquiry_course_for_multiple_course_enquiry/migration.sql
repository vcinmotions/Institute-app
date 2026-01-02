-- CreateTable
CREATE TABLE "public"."EnquiryCourse" (
    "id" SERIAL NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "EnquiryCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."EnquiryCourse" ADD CONSTRAINT "EnquiryCourse_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "public"."Enquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EnquiryCourse" ADD CONSTRAINT "EnquiryCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
