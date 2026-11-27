-- Short institute code for staff usernames (name@2026). Filled in on first use.
ALTER TABLE "Tenant" ADD COLUMN "loginCode" TEXT;
CREATE UNIQUE INDEX "Tenant_loginCode_key" ON "Tenant"("loginCode");
