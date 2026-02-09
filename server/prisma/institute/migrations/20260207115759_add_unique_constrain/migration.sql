/*
  Warnings:

  - A unique constraint covering the columns `[email,clientAdminId]` on the table `Enquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact,clientAdminId]` on the table `Enquiry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_email_clientAdminId_key" ON "public"."Enquiry"("email", "clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_contact_clientAdminId_key" ON "public"."Enquiry"("contact", "clientAdminId");
