import * as express from 'express'
import { getNotifications, clearNotification, getNotificationController } from '../controllers/notification.controller';

const router = express.Router()

router.get('/notification', getNotificationController);

router.put('/notification/:id', clearNotification);

export default router
