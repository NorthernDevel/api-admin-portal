const express = require('express')
const router = express.Router()
const portalController = require('../controllers/portalController')

router.route('/setting').get(portalController.getSettings)

module.exports = router
