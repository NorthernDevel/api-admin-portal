const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

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

module.exports = router
