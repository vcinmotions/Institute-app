import { Router } from "express";
import { compareOptionsController, compareReportsController } from "../controllers/companyCompare.controller";

const router = Router();

router.get("/reports/compare/options", compareOptionsController);
router.get("/reports/compare", compareReportsController);

export default router;
