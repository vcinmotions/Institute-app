// routes/tenantRoutes.ts
import { Router } from "express";
import { addTaskController, getTaskController } from "../controllers/task.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-task", addTaskController);
// router.put("/edit-task/:id", updateCourseController);

router.get("/task", getTaskController);

// router.get("/task/all", getAllCourseController);

// router.post("/task-completion", markCourseAsCompleted);

export default router;
