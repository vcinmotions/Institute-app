// routes/tenantRoutes.ts
import { Router } from 'express';
import { getStudentPaymenController, getStudentPaymenbyIdController, updateStudentPaymentController } from '../controllers/payment.controller';

const router = Router();

router.get('/payment', getStudentPaymenController);

router.get('/payment/:id', getStudentPaymenbyIdController)

router.put('/create-student-payment/:id', updateStudentPaymentController)

export default router;
