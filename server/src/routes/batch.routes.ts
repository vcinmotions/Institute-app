// routes/tenantRoutes.ts
import { Router } from 'express';
import { addBatchController, getAllBatchController, getBatchController } from '../controllers/batch.controller';

const router = Router();

router.post('/create-batch', addBatchController);

router.get('/batch', getBatchController);

router.get('/batch/all', getAllBatchController);

export default router;
