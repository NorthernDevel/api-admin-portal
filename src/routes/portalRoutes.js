import express from 'express'
import portalController from '../controllers/portalController.js'

const router = express.Router()

router.route('/setting').get(portalController.getSettings)

export default router
