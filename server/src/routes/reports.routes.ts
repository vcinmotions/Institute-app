import { Router } from "express";
import {
  getDashboardReportController,
  downloadExcelReportController,
  downloadPdfReportController,
} from "../controllers/report.controller";
// ... auth middlewares etc.

const router = Router();

// Assuming you apply your `requireAuth` and `tenantMiddleware` here
router.get("/reports/data", getDashboardReportController);
router.get("/reports/excel", downloadExcelReportController);
router.get("/reports/pdf", downloadPdfReportController);

export default router;