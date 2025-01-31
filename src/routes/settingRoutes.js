const express = require('express')
const router = express.Router()
const settingController = require('../controllers/settingController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/').get(verifyJWT, settingController.getSettings)
// router.route('/').post(settingController.createNewSettings) Danger route

router.route('/info/:id').patch(verifyJWT, settingController.updateInfo)
router.route('/register/:id').patch(verifyJWT, settingController.updateRegisterType)

module.exports = router
