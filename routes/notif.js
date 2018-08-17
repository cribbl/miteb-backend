var express = require('express');
var router = express.Router();

var notif_controller = require('../controllers/notifController');

router.post('/sendOTP', notif_controller.send_otp);

router.get('/send-email', notif_controller.send_email);

router.get('/send-email-template', notif_controller.sendEventBookingStatusEmailTemplate);

router.post('/send-push', notif_controller.send_push);

module.exports = router;