var express = require('express');
var router = express.Router();

var notif_controller = require('../controllers/notifController');

router.post('/sendOTP', notif_controller.send_otp);

router.post('/send-email', notif_controller.send_email);

router.post('/send-push', notif_controller.send_push);

module.exports = router;