// routes/tenantRoutes.ts
import { Router } from "express";
import { addStationeryItemController, getStationaryController } from "../controllers/stationary.controller";

const router = Router();

// router.post("/add-course", addCourseToExistingStudent);

router.post("/create-stationary", addStationeryItemController);
// router.put("/edit-task/:id", updateCourseController);

 router.get("/stationary", getStationaryController);

// router.get("/task/all", getAllCourseController);

// router.post("/task-completion", markCourseAsCompleted);

export default router;
