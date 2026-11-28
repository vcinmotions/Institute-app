-- Batch.labTimeSlotId becomes optional (batches without a lab) and Batch gets a classType.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Batch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "facultyId" INTEGER,
    "labTimeSlotId" INTEGER,
    "classType" TEXT NOT NULL DEFAULT 'REGULAR',
    "clientAdminId" TEXT NOT NULL,
    "branchId" INTEGER,
    CONSTRAINT "Batch_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Batch_labTimeSlotId_fkey" FOREIGN KEY ("labTimeSlotId") REFERENCES "LabTimeSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Batch_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Batch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Batch" ("id","name","facultyId","labTimeSlotId","classType","clientAdminId","branchId")
  SELECT "id","name","facultyId","labTimeSlotId",
         CASE WHEN "labTimeSlotId" IS NULL THEN 'REGULAR' ELSE 'LAB' END,
         "clientAdminId","branchId" FROM "Batch";
DROP TABLE "Batch";
ALTER TABLE "new_Batch" RENAME TO "Batch";
CREATE UNIQUE INDEX "Batch_labTimeSlotId_clientAdminId_key" ON "Batch"("labTimeSlotId", "clientAdminId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
