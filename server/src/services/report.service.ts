import { PrismaClient } from "../../prisma-client/generated/tenant";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

interface ReportFilters {
  prisma: PrismaClient;
  clientAdminId: string;
  startDate?: Date;
  endDate?: Date;
  reportType: "ENQUIRIES" | "FINANCE" | "STUDENTS";
  sourceId?: number;
  courseId?: number;
  batchId?: number;
  financeStatus?: "ALL" | "PAID" | "OUTSTANDING";
}

// Helper to safely format Javascript Date instances to standard display strings
const formatDateString = (dateObj?: Date | null) => {
  if (!dateObj) return "-";
  const d = new Date(dateObj);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ==========================================
// 1. DATA AGGREGATION SERVICE
// ==========================================
export async function getReportDataService({
  prisma,
  clientAdminId,
  startDate,
  endDate,
  reportType,
  sourceId,
  courseId,
  batchId,
  financeStatus,
}: ReportFilters) {
  
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  
  // Scopes date range directly on when things were logged/created
  const dateFilter = start && end ? { createdAt: { gte: start, lte: end } } : {};

  switch (reportType) {
    case "ENQUIRIES": {
      const enquiryConditions: any = { clientAdminId, ...dateFilter };
      if (sourceId) enquiryConditions.sourceId = sourceId;
      if (courseId) {
        enquiryConditions.enquiryCourse = { some: { courseId } };
      }

      const enquiries = await prisma.enquiry.findMany({
        where: enquiryConditions,
        include: { 
          source: true, 
          enquiryCourse: { include: { course: true } },
          followUps: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
      });

      return enquiries.map(e => {
        // Resolve dynamic relation references safely
        const coursesMapped = e.enquiryCourse.map(ec => ec.course?.name).filter(Boolean).join(", ");
        const latestFollowUp = e.followUps?.[0];

        return {
          "Lead No.": e.srNo || "-",
          "Lead Date": e.enquiryDate ? e.enquiryDate.toLocaleDateString("en-GB") : (e.createdAt ? e.createdAt.toLocaleDateString("en-GB") : "-"),
          "Created Date": formatDateString(e.createdAt),
          "Lead Title": e.name || "-",
          "Contact Number": e.contact || "-",
          "Courses Requested": coursesMapped || "-",
          "Source Channel": e.source?.name || "-",
          "Lead Status": e.leadStatus || "WARM",
          "Discussion / Latest Note": latestFollowUp?.remark || "-",
          "Next FollowUp Date": latestFollowUp?.scheduledAt ? formatDateString(latestFollowUp.scheduledAt) : "-",
          "FollowUp Status": latestFollowUp?.followUpStatus || "-",
          "Converted to Student": e.isConverted ? "Yes" : "No"
        };
      });
    }

    case "FINANCE": {
      const feeConditions: any = { clientAdminId };
      if (start && end) feeConditions.createdAt = { gte: start, lte: end };
      if (courseId) feeConditions.courseId = courseId;

      if (financeStatus === "PAID") {
        feeConditions.paymentStatus = "SUCCESS";
      } else if (financeStatus === "OUTSTANDING") {
        feeConditions.paymentStatus = "PENDING";
      }

      const fees = await prisma.studentFee.findMany({
        where: feeConditions,
        include: { 
          student: {
            include: {
              // 🌟 Include feeStructures to pull the total course invoice limit natively
              feeStructures: true 
            }
          }, 
          course: true 
        },
        orderBy: { createdAt: "desc" },
      });

      return fees.map(f => {
        // Find the specific course structure link matching this fee entry record
        const matchingStructure = f.student?.feeStructures?.find(
          (fs: any) => fs.courseId === f.courseId
        );

        // 🌟 Total Course Amount is retrieved from the FeeStructure, fallback safely to dynamic parts sum if unlinked
        const totalCourseFee = matchingStructure?.totalAmount ?? ((f.amountDue ?? 0) + (f.amountPaid ?? 0));
        const amountPaid = f.amountPaid ?? 0;
        
        // 🌟 FIXED MATHEMATICAL LOGIC: Remaining balance is Total Limit minus what has been cleared down
        const remainingBalance = totalCourseFee - amountPaid;

        return {
          "Receipt No.": f.receiptNo || "-",
          "Student Name": f.student?.fullName || "N/A",
          "Course Program": f.course?.name || "Generic Fee",
          "Total Course Fee": totalCourseFee,
          "Amount Paid": amountPaid,
          "Remaining Balance": remainingBalance,
          "Invoice Due Component": f.amountDue ?? 0,
          "Payment Status": f.paymentStatus || "-",
          "Due Date String": f.dueDate ? f.dueDate.toLocaleDateString("en-GB") : "-",
        };
      });
    }

    case "STUDENTS": {
      const studentConditions: any = { clientAdminId, ...dateFilter };
      if (courseId || batchId) {
        studentConditions.studentCourses = {
          some: {
            ...(courseId && { courseId }),
            ...(batchId && { batchId }),
          }
        };
      }

      const students = await prisma.student.findMany({
        where: studentConditions,
        include: { studentCourses: { include: { course: true, batch: true } } },
        orderBy: { createdAt: "desc" },
      });

      return students.map(s => ({
        "Admission No.": s.admissionNumber || "-",
        "Full Name": s.fullName || "-",
        "Contact Number": s.contact || "-",
        "Enrolled Courses": s.studentCourses.map(sc => sc.course?.name).filter(Boolean).join(", ") || "-",
        "Assigned Batches": s.studentCourses.map(sc => sc.batch?.name || "N/A").join(", ") || "-",
        "Admission Date": s.admissionDate ? s.admissionDate.toLocaleDateString("en-GB") : "-",
      }));
    }

    default:
      throw new Error("Invalid report type");
  }
}

// ==========================================
// 2. EXCEL GENERATION SERVICE
// ==========================================
export async function generateExcelReportService(filters: ReportFilters): Promise<Buffer> {
  const data = await getReportDataService(filters);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${filters.reportType} Report`);

  // --- Title & Header Metadata block ---
  worksheet.mergeCells("A1:L1");
  const companyCell = worksheet.getCell("A1");
  companyCell.value = "MY DEMO COMPANY";
  companyCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1F2937" } };
  companyCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells("A2:L2");
  const reportCell = worksheet.getCell("A2");
  const startStr = filters.startDate ? formatDateString(new Date(filters.startDate)) : "Beginning";
  const endStr = filters.endDate ? formatDateString(new Date(filters.endDate)) : "Present";
  reportCell.value = `${filters.reportType.charAt(0) + filters.reportType.slice(1).toLowerCase()} Activity Report - from ${startStr} to ${endStr}`;
  reportCell.font = { name: "Arial", size: 11, italic: true, color: { argb: "FF4B5563" } };
  reportCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(2).height = 22;

  // Spacing row before table
  worksheet.addRow([]);

  if (data.length === 0) {
    worksheet.mergeCells("A4:L4");
    worksheet.getCell("A4").value = "No records located matching current filter criteria.";
    worksheet.getCell("A4").font = { italic: true };
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  // Add headers dynamically
  const headers = Object.keys(data[0]);
  const headerRowNumber = 4;
  
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(headerRowNumber, index + 1);
    cell.value = header;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF374151" } // Charcoal Gray Header background
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "D1D5DB" } },
      bottom: { style: "medium", color: { argb: "9CA3AF" } },
      left: { style: "thin", color: { argb: "D1D5DB" } },
      right: { style: "thin", color: { argb: "D1D5DB" } }
    };
  });
  worksheet.getRow(headerRowNumber).height = 26;

  // Add Data Rows
  data.forEach((item: any) => {
    const rowCells = headers.map(h => item[h]);
    const addedRow = worksheet.addRow(rowCells);
    addedRow.height = 22;
    
    // Style body cells
    addedRow.eachCell((cell) => {
      cell.font = { name: "Arial", size: 9 };
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } }
      };
    });
  });

  // Explicit dynamic structural column auto sizing
  worksheet.columns = headers.map(() => ({
    width: 20
  }));

  // Append Corporate Footer Tagline
  worksheet.addRow([]);
  const footerRow = worksheet.addRow(["Powered by www.vcinmotions.com"]);
  footerRow.getCell(1).font = { name: "Arial", size: 8, italic: true, color: { argb: "FF9CA3AF" } };

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

// ==========================================
// 3. PDF GENERATION SERVICE
// ==========================================
export async function generatePdfReportService(filters: ReportFilters): Promise<Buffer> {
  const data = await getReportDataService(filters);

  return new Promise((resolve, reject) => {
    try {
      // Initialize layout in Landscape orientation to fully accommodate multi-column datasets cleanly
      const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // --- Corporate Branded Document Header ---
      doc.fillColor("#1f2937").font("Helvetica-Bold").fontSize(18).text("MY DEMO COMPANY", 30, 30);
      
      const startStr = filters.startDate ? formatDateString(new Date(filters.startDate)) : "Beginning";
      const endStr = filters.endDate ? formatDateString(new Date(filters.endDate)) : "Present";
      
      doc.fillColor("#4b5563").font("Helvetica-Oblique").fontSize(11)
         .text(`${filters.reportType.charAt(0) + filters.reportType.slice(1).toLowerCase()} Activity Report - from ${startStr} to ${endStr}`, 30, 52);
      
      doc.moveTo(30, 70).lineTo(812, 70).strokeColor("#e5e7eb").lineWidth(1).stroke();

      if (data.length === 0) {
        doc.fillColor("#6b7280").font("Helvetica").fontSize(11).text("No records matching specified metrics were found.", 30, 95);
        doc.end();
        return;
      }

      // --- Grid/Table Calculations ---
      const headers = Object.keys(data[0]);
      const printableWidth = 782; // 842 total landscape width - 60 horizontal margins
      const colWidth = printableWidth / headers.length;
      let currentY = 90;

      // Draw Grid Headers
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
      
      // Draw header row background fill container box
      doc.rect(30, currentY, printableWidth, 22).fill("#374151");
      doc.fillColor("#ffffff");

      headers.forEach((header, idx) => {
        doc.text(header, 35 + (idx * colWidth), currentY + 7, {
          width: colWidth - 8,
          align: "left",
          lineBreak: false
        });
      });

      currentY += 22;

      // Draw Grid Rows
      doc.font("Helvetica").fontSize(7.5).fillColor("#374151");

      data.forEach((row: any) => {
        // Auto-wrap page break check
        if (currentY > 530) {
          doc.addPage();
          currentY = 40;
          
          // Re-draw background container headers on the new page
          doc.rect(30, currentY, printableWidth, 22).fill("#374151");
          doc.fillColor("#ffffff").font("Helvetica-Bold");
          headers.forEach((header, idx) => {
            doc.text(header, 35 + (idx * colWidth), currentY + 7, { width: colWidth - 8, align: "left" });
          });
          currentY += 22;
          doc.font("Helvetica").fontSize(7.5).fillColor("#374151");
        }

        // Draw dynamic separation row borders
        doc.moveTo(30, currentY + 18).lineTo(812, currentY + 18).strokeColor("#f3f4f6").lineWidth(0.5).stroke();

        headers.forEach((header, idx) => {
          const value = String(row[header] !== undefined && row[header] !== null ? row[header] : "-");
          doc.text(value, 35 + (idx * colWidth), currentY + 5, {
            width: colWidth - 8,
            align: "left",
            height: 12,
            ellipsis: true
          });
        });

        currentY += 18;
      });

      // --- Document Footer Section ---
      doc.fillColor("#9ca3af").font("Helvetica-Oblique").fontSize(8)
         .text("Powered by www.vcinmotions.com", 30, 565, { align: "left" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}