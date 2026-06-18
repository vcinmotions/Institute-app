import { Request, Response } from "express";
import {
  getReportDataService,
  generateExcelReportService,
  generatePdfReportService,
} from "../services/report.service";
import { reportQuerySchema } from "../validators/report.schema";

// ==========================================
// 1. DASHBOARD REPORT CONTROLLER (JSON)
// ==========================================
export async function getDashboardReportController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user as any; 

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = reportQuerySchema.parse(req.query);

    // Pass the extra validated properties down to the data layer service
    const data = await getReportDataService({
      prisma,
      clientAdminId: user.clientAdminId,
      reportType: query.reportType,
      startDate: query.startDate,
      endDate: query.endDate,
      sourceId: query.sourceId,
      courseId: query.courseId,
      batchId: query.batchId,
      financeStatus: query.financeStatus,
    });

    return res.status(200).json({
      message: `${query.reportType} report data fetched successfully`,
      data,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("Error fetching report data:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ==========================================
// 2. EXCEL DOWNLOAD CONTROLLER
// ==========================================
export async function downloadExcelReportController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user as any;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = reportQuerySchema.parse(req.query);

    const buffer = await generateExcelReportService({
      prisma,
      clientAdminId: user.clientAdminId,
      reportType: query.reportType,
      startDate: query.startDate,
      endDate: query.endDate,
      sourceId: query.sourceId,
      courseId: query.courseId,
      batchId: query.batchId,
      financeStatus: query.financeStatus,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${query.reportType}-Report.xlsx"`
    );

    return res.send(buffer);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("Error generating Excel report:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ==========================================
// 3. PDF DOWNLOAD CONTROLLER
// ==========================================
export async function downloadPdfReportController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user as any;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = reportQuerySchema.parse(req.query);

    const buffer = await generatePdfReportService({
      prisma,
      clientAdminId: user.clientAdminId,
      reportType: query.reportType,
      startDate: query.startDate,
      endDate: query.endDate,
      sourceId: query.sourceId,
      courseId: query.courseId,
      batchId: query.batchId,
      financeStatus: query.financeStatus,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${query.reportType}-Report.pdf"`
    );

    return res.send(buffer);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("Error generating PDF report:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}