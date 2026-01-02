// routes/tenantRoutes.ts
import { Router } from "express";
import {
  addFacultyController,
  getFacultyController,
  assignBatchToFacultyController,
  getFacultyBatches,
  updateFacultyController,
} from "../controllers/faculty.controller";

const router = Router();

router.post("/create-faculty", addFacultyController);

router.get("/faculty", getFacultyController);

router.put("/assign-batch", assignBatchToFacultyController);

router.put("/edit-faculty/:id", updateFacultyController);

// GET /api/faculty/:facultyId/batches
router.get("/:facultyId/batches", getFacultyBatches);

export default router;
