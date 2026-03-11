// routes/tenantRoutes.ts
import { Router } from "express";
import { addTestController, getTestController } from "../controllers/test.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-test", addTestController);
// router.put("/edit-test/:id", updateCourseController);

router.get("/test", getTestController);

// router.get("/task/all", getAllCourseController);

// router.post("/task-completion", markCourseAsCompleted);

export default router;
