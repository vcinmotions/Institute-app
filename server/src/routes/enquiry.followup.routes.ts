// routes/enquiryRoutes.ts
import { Router } from 'express';
import { addFollowUpController, completeFollowUpController, editFollowUpController, getFollowUpController, updateFollowUpController } from '../controllers/enquiry.followup.controller';

const router = Router();

router.post('/followup', addFollowUpController);
router.put('/followup/:id', updateFollowUpController);
router.put('/followup-edit/:id', editFollowUpController);
router.get('/followup/:id', getFollowUpController);
router.post('/followup/complete', completeFollowUpController);

export default router;
