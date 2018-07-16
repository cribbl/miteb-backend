var express = require('express');
var router = express.Router();

var complaints_controller = require('../controllers/complaintsController');

router.get('/generate-sheet', complaints_controller.generate_sheet);

module.exports = router;