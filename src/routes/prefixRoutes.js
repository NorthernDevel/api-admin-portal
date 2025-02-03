import express from 'express'
import prefixController from '../controllers/prefixController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router
  .route('/')
  .get(verifyJWT, prefixController.getAllPrefixes)
  .post(prefixController.createNewPrefix)

router.route('/:id').get(verifyJWT, prefixController.getPrefixById)

export default router
