// routes/tenantRoutes.ts
import { Router } from "express";
import {
  createLab,
  getLabController,
  updateLabController,
} from "../controllers/lab.controller";

const router = Router();

// Same handlers serve both modules; the route decides which one (LAB or CLASS).
const asKind = (kind: "LAB" | "CLASS") => (req: any, _res: any, next: any) => { req.labKind = kind; next(); };

router.get("/all-lab", asKind("LAB"), getLabController);
router.get("/all-class", asKind("CLASS"), getLabController);

// POST /api/labs/create
router.post("/create-lab", asKind("LAB"), createLab);
router.put("/edit-lab/:id", asKind("LAB"), updateLabController);

// Classes: for institutes without a computer lab. Creating one also creates a batch for every time slot.
router.post("/create-class", asKind("CLASS"), createLab);
router.put("/edit-class/:id", asKind("CLASS"), updateLabController);

export default router;
