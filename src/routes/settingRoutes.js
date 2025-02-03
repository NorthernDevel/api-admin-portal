import express from 'express'
import settingController from '../controllers/settingController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.route('/').get(verifyJWT, settingController.getSettings)
// router.route('/').post(settingController.createNewSettings) Danger route

router.route('/info/:id').patch(verifyJWT, settingController.updateInfo)
router
  .route('/register/:id')
  .patch(verifyJWT, settingController.updateRegisterType)

router.route('/banners/:id').put(verifyJWT, settingController.updateBanners)

export default router
