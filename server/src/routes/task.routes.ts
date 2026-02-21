// routes/tenantRoutes.ts
import { Router } from "express";
import { addStudentTaskController, addTaskController, editTaskController, getTaskController } from "../controllers/task.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-task", addTaskController);
router.put("/edit-task/:id", editTaskController);
router.post("/task-publish", addStudentTaskController);
router.get("/task", getTaskController);

// router.get("/task/all", getAllCourseController);

export default router;
