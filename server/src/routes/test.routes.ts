// routes/tenantRoutes.ts
import { Router } from "express";
import { addTestController } from "../controllers/test.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-test", addTestController);
// router.put("/edit-task/:id", updateCourseController);

// router.get("/task", getCourseController);

// router.get("/task/all", getAllCourseController);

// router.post("/task-completion", markCourseAsCompleted);

export default router;
