// routes/tenantRoutes.ts
import { Router } from "express";
import { createDraftTestController, editTestController, getTestByIdController, getTestController, publishAndAssignTestController } from "../controllers/test.controller";
import { getTestStudentsController, saveTestMarksController } from "../controllers/testMarks.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-test", createDraftTestController);
// router.put("/edit-test/:id", updateCourseController);
// Endpoint for publishing and assigning directly to active students
router.post("/create-test/publish", publishAndAssignTestController);

router.get("/test", getTestController);

// GET single test by ID route link
router.get("/test/:id", getTestByIdController);

// Students of a test with marks/grade, and saving marks
router.get("/test/:id/students", getTestStudentsController);
router.put("/test-marks", saveTestMarksController);

// ✅ REGISTER THE PUT ROUTE WITH PARAMETER MATCHING EXTENSIONS
router.put("/edit-test/:id", editTestController);

// router.post("/task-completion", markCourseAsCompleted);

export default router;
