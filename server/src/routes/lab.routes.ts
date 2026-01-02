// routes/tenantRoutes.ts
import { Router } from "express";
import {
  createLab,
  getLabController,
  updateLabController,
} from "../controllers/lab.controller";

const router = Router();

router.get("/all-lab", getLabController);

// POST /api/labs/create
router.post("/create-lab", createLab);
router.put("/edit-lab/:id", updateLabController);

export default router;
