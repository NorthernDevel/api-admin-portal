const express = require('express')
const router = express.Router()
const connectionController = require('../controllers/connectionController')

router.route('/status').get(connectionController.getStatus)

module.exports = router
