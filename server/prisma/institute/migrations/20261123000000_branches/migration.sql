CREATE TABLE "Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "contact" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Branch_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "Lab" ADD COLUMN "branchId" INTEGER REFERENCES "Branch"("id");
ALTER TABLE "Batch" ADD COLUMN "branchId" INTEGER REFERENCES "Branch"("id");
ALTER TABLE "Student" ADD COLUMN "branchId" INTEGER REFERENCES "Branch"("id");
ALTER TABLE "Enquiry" ADD COLUMN "branchId" INTEGER REFERENCES "Branch"("id");
