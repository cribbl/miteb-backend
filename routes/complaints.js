var express = require('express')
var router = express.Router()

var complaintsController = require('../controllers/complaintsController')

router.get('/generate-sheet', complaintsController.generate_sheet)

module.exports = router
