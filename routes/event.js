var express = require('express')
var router = express.Router()

var eventController = require('../controllers/eventController')

router.get('/generate-pdf', eventController.generate_pdf)
router.get('/generate-sheet', eventController.generate_sheet)
router.get('/generate-daily-events', eventController.generate_daily_events)

module.exports = router
