-- CreateTable
CREATE TABLE "ClientAdmin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "logo" TEXT,
    "certificateName" TEXT,
    "stamp" TEXT,
    "sign" TEXT,
    "contact" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "currentSessionToken" TEXT,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "RoleUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "currentSessionToken" TEXT,
    "lastLoginAt" DATETIME,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "RoleUser_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "ActivityLog_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "srNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "course" TEXT,
    "source" TEXT,
    "alternateContact" TEXT,
    "age" INTEGER,
    "location" TEXT,
    "city" TEXT,
    "gender" TEXT,
    "dob" DATETIME,
    "referedBy" TEXT,
    "leadStatus" TEXT NOT NULL DEFAULT 'WARM',
    "enquiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "studentId" INTEGER,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Enquiry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enquiry_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnquiryCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enquiryId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "EnquiryCourse_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EnquiryCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EnquiryCourse_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "doneAt" DATETIME,
    "remark" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "followUpStatus" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "FollowUp_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpId" TEXT,
    "enquiryId" TEXT,
    "paymentId" INTEGER,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "StudentFee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdmissionNumberConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT,
    "suffix" TEXT,
    "numberLength" INTEGER NOT NULL DEFAULT 4,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "clientAdminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serialNumber" INTEGER NOT NULL,
    "studentCode" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "photoUrl" TEXT,
    "contact" TEXT NOT NULL,
    "parentsContact" TEXT,
    "email" TEXT,
    "residentialAddress" TEXT,
    "permenantAddress" TEXT,
    "dob" DATETIME,
    "gender" TEXT,
    "religion" TEXT,
    "idProofType" TEXT,
    "idProofNumber" TEXT,
    "admissionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Student_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "description" TEXT,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Course_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseFeeStructure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentType" JSONB NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "CourseFeeStructure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseFeeStructure_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "facultyId" INTEGER,
    "labTimeSlotId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Batch_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Batch_labTimeSlotId_fkey" FOREIGN KEY ("labTimeSlotId") REFERENCES "LabTimeSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Batch_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BatchCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "pcsReserved" INTEGER DEFAULT 0,
    CONSTRAINT "BatchCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BatchCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "joiningDate" DATETIME NOT NULL,
    "specialization" TEXT,
    "role" TEXT NOT NULL DEFAULT 'FACULTY',
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "currentSessionToken" TEXT,
    "lastLoginAt" DATETIME,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Faculty_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "totalPCs" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Lab_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabTimeSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "labId" INTEGER NOT NULL,
    "availablePCs" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "LabTimeSlot_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabTimeSlot_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentStructureType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "installmentCount" INTEGER
);

-- CreateTable
CREATE TABLE "InstallmentDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CourseFeeStructureId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "InstallmentDetail_CourseFeeStructureId_fkey" FOREIGN KEY ("CourseFeeStructureId") REFERENCES "CourseFeeStructure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabAllocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "labTimeSlotId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "pcNumber" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "LabAllocation_labTimeSlotId_fkey" FOREIGN KEY ("labTimeSlotId") REFERENCES "LabTimeSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabAllocation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabAllocation_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "studentCode" TEXT NOT NULL,
    "batchId" INTEGER,
    "internalNotes" TEXT,
    "status" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StudentCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentCourse_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentType" TEXT NOT NULL,
    "installmentCount" INTEGER,
    "installmentTypeId" INTEGER,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "FeeStructure_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeeStructure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeeStructure_installmentTypeId_fkey" FOREIGN KEY ("installmentTypeId") REFERENCES "InstallmentDetail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FeeStructure_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentFeeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentFeeId" INTEGER NOT NULL,
    "amountPaid" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    CONSTRAINT "StudentFeeLog_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "StudentFee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "dueDate" DATETIME NOT NULL,
    "amountDue" REAL NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "paymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" TEXT,
    "receiptNo" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isOpeningBalance" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StudentFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentFee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentFee_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StationeryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StationeryItem_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StationeryIssue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remarks" TEXT,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StationeryIssue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StationeryIssue_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StationeryIssue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StationeryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StationeryIssue_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "present" BOOLEAN NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "batchId" INTEGER,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "batchId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Task_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "assignedDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "facultyRemarks" TEXT,
    "grade" TEXT,
    "taskId" INTEGER NOT NULL,
    "facultyId" INTEGER,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StudentTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTask_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTask_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentTask_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "batchId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Test_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Test_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Test_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "testDate" DATETIME NOT NULL,
    "assignedDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalMarks" INTEGER,
    "marksObtained" INTEGER,
    "grade" TEXT,
    "testId" INTEGER NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "StudentTest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentTest_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseCompletion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentCourseId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "completionDate" DATETIME NOT NULL,
    "feedback" TEXT,
    "remarks" TEXT,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "CourseCompletion_studentCourseId_fkey" FOREIGN KEY ("studentCourseId") REFERENCES "StudentCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseCompletion_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "studentCourseId" INTEGER NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_studentCourseId_fkey" FOREIGN KEY ("studentCourseId") REFERENCES "StudentCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientAdminId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" TEXT,
    "studentId" INTEGER,
    "courseId" INTEGER,
    "facultyId" INTEGER,
    "labId" INTEGER,
    CONSTRAINT "FinancialRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FinancialRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FinancialRecord_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FinancialRecord_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FinancialRecord_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "ClientAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAdmin_email_key" ON "ClientAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAdmin_slug_key" ON "ClientAdmin"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RoleUser_email_key" ON "RoleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_srNo_key" ON "Enquiry"("srNo");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_studentId_key" ON "Enquiry"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_email_clientAdminId_key" ON "Enquiry"("email", "clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_contact_clientAdminId_key" ON "Enquiry"("contact", "clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "EnquiryCourse_enquiryId_courseId_key" ON "EnquiryCourse"("enquiryId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_followUpId_key" ON "Notification"("followUpId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_enquiryId_key" ON "Notification"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_paymentId_key" ON "Notification"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionNumberConfig_clientAdminId_key" ON "AdmissionNumberConfig"("clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_serialNumber_key" ON "Student"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeeStructure_courseId_key" ON "CourseFeeStructure"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_labTimeSlotId_clientAdminId_key" ON "Batch"("labTimeSlotId", "clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchCourse_batchId_courseId_key" ON "BatchCourse"("batchId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LabAllocation_labTimeSlotId_pcNumber_key" ON "LabAllocation"("labTimeSlotId", "pcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabAllocation_labTimeSlotId_studentId_key" ON "LabAllocation"("labTimeSlotId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_studentId_courseId_key" ON "FeeStructure"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeeLog_receiptNo_key" ON "StudentFeeLog"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_studentCourseId_key" ON "Certificate"("studentCourseId");
