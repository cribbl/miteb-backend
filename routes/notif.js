var express = require('express')
var router = express.Router()

var notifController = require('../controllers/notifController')

router.post('/sendOTP', notifController.send_otp)

router.post('/send-email', notifController.send_email)

router.get('/send-email-template', notifController.sendEventBookingStatusEmailTemplate)

router.get('/send-complaint-email', notifController.sendComplaintEmailTemplate)

router.get('/send-clubApproval-email', notifController.sendClubApprovalStatusEmailTemplate)

router.post('/send-sms', notifController.send_sms)

router.get('/send-email-template', notifController.sendEventBookingStatusEmailTemplate)

router.get('/send-complaint-email', notifController.sendComplaintEmailTemplate)

router.get('/send-clubApproval-email', notifController.sendClubApprovalStatusEmailTemplate)

router.post('/send-push', notifController.send_push)

router.get('/remind-push', notifController.send_push_custom)

module.exports = router
