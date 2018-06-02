const express = require('express');
const router = express.Router();

var auth_controller = require('../controllers/authController.js');

router.get('/', auth_controller.index);

router.get('/send-otp', auth_controller.send_otp);

module.exports = router;