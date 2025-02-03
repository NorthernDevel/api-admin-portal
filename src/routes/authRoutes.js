import express from 'express'
import authController from '../controllers/authController.js'

const router = express.Router()

router.route('/').post(authController.login)

router.route('/refresh').get(authController.refresh)

router.route('/logout').get(authController.logout)

export default router
