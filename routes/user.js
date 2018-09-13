var express = require('express')
var router = express.Router()

var userController = require('../controllers/userController')

router.post('/signup-club', userController.signup_club)

router.post('/signup-fa', userController.signup_fa)

router.get('/signup-custom', userController.custom_signup)

router.get('/update-user', userController.update_user)

module.exports = router
