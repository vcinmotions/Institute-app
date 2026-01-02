import * as express from 'express'
import { loginController } from '../controllers/auth.controller'
import { masterAuthMiddleware } from '../middlewares/master.auth.middleware'
import { masterLoginController } from '../controllers/master.auth.controller'

const router = express.Router()

router.post('/login', loginController)

router.post('/master-login', masterLoginController);

export default router
