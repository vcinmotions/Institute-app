import * as express from 'express'
import { loginController, selectCompanyController, switchCompanyController, logoutController, heartbeatController } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { masterAuthMiddleware } from '../middlewares/master.auth.middleware'
import { masterLoginController } from '../controllers/master.auth.controller'

const router = express.Router()

router.post('/login', loginController)
router.post('/select-company', selectCompanyController)
router.post('/switch-company', authMiddleware, switchCompanyController)
router.post('/logout', authMiddleware, logoutController)
router.post('/heartbeat', authMiddleware, heartbeatController)

router.post('/master-login', masterLoginController);

export default router
