-- CreateTable
CREATE TABLE "public"."Lab" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "totalPCs" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabTimeSlot" (
    "id" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "labId" INTEGER NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "availablePCs" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "LabTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabAllocation" (
    "id" SERIAL NOT NULL,
    "labTimeSlotId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "pcNumber" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "LabAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabAllocation_labTimeSlotId_pcNumber_key" ON "public"."LabAllocation"("labTimeSlotId", "pcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabAllocation_labTimeSlotId_studentId_key" ON "public"."LabAllocation"("labTimeSlotId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."Lab" ADD CONSTRAINT "Lab_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabTimeSlot" ADD CONSTRAINT "LabTimeSlot_labId_fkey" FOREIGN KEY ("labId") REFERENCES "public"."Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabTimeSlot" ADD CONSTRAINT "LabTimeSlot_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabTimeSlot" ADD CONSTRAINT "LabTimeSlot_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabAllocation" ADD CONSTRAINT "LabAllocation_labTimeSlotId_fkey" FOREIGN KEY ("labTimeSlotId") REFERENCES "public"."LabTimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabAllocation" ADD CONSTRAINT "LabAllocation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabAllocation" ADD CONSTRAINT "LabAllocation_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
