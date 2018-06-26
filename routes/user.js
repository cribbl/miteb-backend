var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

router.post('/signup', user_controller.signup);

router.get('/update-user', user_controller.update_user);


module.exports = router;