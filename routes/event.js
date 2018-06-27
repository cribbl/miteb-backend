var express = require('express');
var router = express.Router();

var event_controller = require('../controllers/eventController');

router.get('/generate-pdf', event_controller.generate_pdf);

module.exports = router;