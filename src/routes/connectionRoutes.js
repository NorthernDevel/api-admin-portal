import express from 'express'
import connectionController from '../controllers/connectionController.js'

const router = express.Router()

router.route('/status').get(connectionController.getStatus)

router.route('/close-all').get(connectionController.closeAll)

export default router
