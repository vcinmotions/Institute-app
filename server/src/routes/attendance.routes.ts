// routes/attendanceRoutes.ts
import express from "express";
import { exportMonthlyAttendance, getAttendanceByBatch, getAttendanceByCourse, markAttendance } from "../controllers/attendance.controller";

const router = express.Router();

router.post("/attendance/mark", markAttendance);

router.get("/attendance/:batchId", getAttendanceByBatch); // ✅ new route
router.get("/attendance/:courseId", getAttendanceByCourse); // ✅ new route

router.get("/attendance-report", exportMonthlyAttendance);

export default router;
