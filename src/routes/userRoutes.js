import express from 'express'
import userController from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router
  .route('/')
  .get(verifyJWT, userController.getAllUsers)
  .post(userController.createNewUser)

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(verifyJWT, userController.updateUser)
  .delete(verifyJWT, userController.deleteUser)

router
  .route('/change-password/:id')
  .patch(verifyJWT, userController.changeUserPassword)

export default router
