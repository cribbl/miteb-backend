var express = require('express');
var router = express.Router();

var notif_controller = require('../controllers/notifController');

router.post('/sendOTP', notif_controller.send_otp);

router.post('/send-email', notif_controller.send_email);

router.get('/send-email-template', notif_controller.sendEventBookingStatusEmailTemplate);

router.get('/send-complaint-email', notif_controller.sendComplaintEmailTemplate);

router.get('/send-clubApproval-email', notif_controller.sendClubApprovalStatusEmailTemplate)

router.post('/send-sms', notif_controller.send_sms);

router.get('/send-email-template', notif_controller.sendEventBookingStatusEmailTemplate);

router.get('/send-complaint-email', notif_controller.sendComplaintEmailTemplate);

router.get('/send-clubApproval-email', notif_controller.sendClubApprovalStatusEmailTemplate)

router.post('/send-push', notif_controller.send_push);

router.get('/remind-push', notif_controller.send_push_custom);

module.exports = router;