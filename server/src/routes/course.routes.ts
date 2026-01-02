// routes/tenantRoutes.ts
import { Router } from "express";
import {
  addCourseController,
  addCourseToExistingStudent,
  getAllCourseController,
  getCourseController,
  markCourseAsCompleted,
  updateCourseController,
} from "../controllers/course.controller";

const router = Router();

router.post("/add-course", addCourseToExistingStudent);

router.post("/create-course", addCourseController);
router.put("/edit-course/:id", updateCourseController);

router.get("/course", getCourseController);

router.get("/course/all", getAllCourseController);

router.post("/course-completion", markCourseAsCompleted);

export default router;
