const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
require('./config/config.js')

const app = express()

var allowCrossDomain = function (req, res, next) {
  var devAllowedOrigins = ['http://localhost:3000', 'https://staging.cribblservices.com']
  var prodAllowedOrigins = ['https://prod.cribblservices.com']

  var allowedOrigins = process.env.NODE_ENV === 'production' ? prodAllowedOrigins : devAllowedOrigins
  var origin = req.headers.origin
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
}

<<<<<<< Updated upstream
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(allowCrossDomain)
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {
  if (process.env.NODE_ENV === 'production' && (req.headers.origin !== 'https://prod.cribblservices.com')) {
    res.status(503).send('Unauthorized')
  } else if (process.env.NODE_ENV === 'development' && (req.headers.origin !== 'https://staging.cribblservices.com')) {
    res.status(503).send('Unauthorized')
  } else {
    next()
  }
=======
// app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowCrossDomain);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
	// console.log(req.headers)
	if(process.env.NODE_ENV == 'production' && (req.headers.origin != 'https://prod.cribblservices.com')) {
		res.status(503).send("Unauthorized");
		return;
	}
	else if(process.env.NODE_ENV == 'development' && (req.headers.origin != 'https://staging.cribblservices.com')) {
		// res.status(503).send("Unauthorized");
		// return;
	}
	else{
		next();
	}
>>>>>>> Stashed changes
})

app.get('/', function (req, res) {
  res.send(`This is the ${app.settings.env} server`)
})

app.get('/', function (req, res) {
  res.render('test')
})

const userRoutes = require('./routes/user')
const eventRoutes = require('./routes/event')
const notifRoutes = require('./routes/notif')
const complaintsRoutes = require('./routes/complaints')

app.use('/user', userRoutes)
app.use('/event', eventRoutes)
app.use('/notif', notifRoutes)
app.use('/complaint', complaintsRoutes)

app.listen(process.env.PORT || 9000, function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env)
})
