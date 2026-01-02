-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "timePerDay" TEXT;

-- CreateTable
CREATE TABLE "public"."TeachingSchedule" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "TeachingSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TeachingSchedule" ADD CONSTRAINT "TeachingSchedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
