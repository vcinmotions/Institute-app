// routes/tenantRoutes.ts
import { Router } from 'express';
import { addStudentCourseController, getStudentCourseController } from '../controllers/studentCourse.controller';

const router = Router();

router.post('/student-course', addStudentCourseController);

router.get('/student-course', getStudentCourseController)


export default router;
