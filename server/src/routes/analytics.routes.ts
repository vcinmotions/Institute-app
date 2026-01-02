import express from "express";
import { financialSummaryController, outstandingReportController, profitAnalyticsController } from "../controllers/analytics.controller";

const router = express.Router();
router.get("/profit", profitAnalyticsController);

router.get("/financial-summary", financialSummaryController);

router.get('/outstanding', outstandingReportController);

export default router;
