CREATE TABLE "ActivationKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "maxActivations" INTEGER NOT NULL DEFAULT 1,
    "transferLimit" INTEGER NOT NULL DEFAULT 3,
    "transfersUsed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstActivatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ActivationKey_key_key" ON "ActivationKey"("key");

CREATE TABLE "ActivationDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activationKeyId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "os" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "activatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" DATETIME,
    CONSTRAINT "ActivationDevice_activationKeyId_fkey" FOREIGN KEY ("activationKeyId") REFERENCES "ActivationKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ActivationDevice_activationKeyId_deviceId_key" ON "ActivationDevice"("activationKeyId", "deviceId");
