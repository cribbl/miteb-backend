const express = require('express');
const router = express.Router();

var auth_controller = require('../controllers/authController.js');
var user_controller = require('../controllers/userController.js');
var post_controller = require('../controllers/postController.js');

router.get('/',user_controller.index);

router.get('/update-user', user_controller.update_user);

router.get('/send-otp', auth_controller.send_otp);

router.get('/generate-pdf', auth_controller.generate_pdf);

router.post('/send-notif', post_controller.send_notif);

router.post('/send-email', post_controller.send_email);

module.exports = router;