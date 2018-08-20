const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
require('./config/config.js');
app = express();
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://staging.cribblservices.com/*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowCrossDomain);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// app.use(function(req, res, next) {
// 	// if((req.headers.authorization == 'secret')) {
// 	// 	return res.status(403).send({error: 'Unauthorised'});
// 	// }
// 	next();
// })

app.get('/', function(req, res) {
	res.send(`This is the ${app.settings.env} server`);
	// res.render('test')
})

var userRoutes = 	require('./routes/user')
var eventRoutes = require('./routes/event')
var notifRoutes = require('./routes/notif')
var complaintsRoutes = require('./routes/complaints')

app.use('/user', userRoutes);
app.use('/event', eventRoutes);
app.use('/notif', notifRoutes);
app.use('/complaint', complaintsRoutes);


app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
