const express = require('express')
const router = express.Router()
const prefixController = require('../controllers/prefixController')
const verifyJWT = require('../middleware/verifyJWT')

router
  .route('/')
  .get(verifyJWT, prefixController.getAllPrefixes)
  .post(verifyJWT, prefixController.createNewPrefix)

router.route('/:id').get(verifyJWT, prefixController.getPrefixById)

module.exports = router
