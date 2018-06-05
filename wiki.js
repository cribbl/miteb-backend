const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
	res.send('wiki home page');
});

router.get('/about',function(req,res){
	res.send('the about page');
});

module.exports = router;
