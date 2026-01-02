-- CreateTable
CREATE TABLE "public"."ClientAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAdmin_email_key" ON "public"."ClientAdmin"("email");

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enquiry" ADD CONSTRAINT "Enquiry_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
