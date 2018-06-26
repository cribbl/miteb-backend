const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
require('./config/config.js');
app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	// if((req.headers.authorization == 'secret')) {
	// 	return res.status(403).send({error: 'Unauthorised'});
	// }
	next();
})

var userRoutes = 	require('./routes/user')
var eventRoutes = require('./routes/event')
var notifRoutes = require('./routes/notif')

app.use('/user', userRoutes);
app.use('/event', eventRoutes);
app.use('/notif', notifRoutes);


app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
