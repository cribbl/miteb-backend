var express = require('express')
var router = express.Router()

var user_controller = require('../controllers/userController')

router.post('/signup-club', user_controller.signup_club)

router.post('/signup-fa', user_controller.signup_fa)

router.get('/signup-custom', user_controller.custom_signup)

router.get('/update-user', user_controller.update_user)

module.exports = router
