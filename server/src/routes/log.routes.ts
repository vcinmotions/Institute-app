// routes/tenantRoutes.ts
import { Router } from 'express';
import { getLogController } from '../controllers/log.controller';

const router = Router();

router.get('/log', getLogController);

export default router;
