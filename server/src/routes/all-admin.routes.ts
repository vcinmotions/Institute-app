// routes/tenantRoutes.ts
import { Router } from 'express';
import { getAllClientAdmins } from '../controllers/all-admin.controller';

const router = Router();

router.get('/all-client', getAllClientAdmins);

export default router;
