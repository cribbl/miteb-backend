const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
require('./config/config.js')
const app = express()
const PORT_FRONTEND = 3000
const PORT_BACKEND = 9000
var allowCrossDomain = function (req, res, next) {
  var devAllowedOrigins = ['http://localhost:' + PORT_FRONTEND, 'https://staging.cribblservices.com']
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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(allowCrossDomain)
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === 'production' && (req.headers.origin !== 'https://prod.cribblservices.com')) {
    res.status(503).send('Unauthorized')
  }
  next()
})

app.get('/', function (req, res) {
  res.send(`This is the ${app.settings.env} server`)
})

app.get('/', function (req, res) {
  res.render('test')
})

var userRoutes = require('./routes/user')
var eventRoutes = require('./routes/event')
var notifRoutes = require('./routes/notif')
var complaintsRoutes = require('./routes/complaints')

app.use('/user', userRoutes)
app.use('/event', eventRoutes)
app.use('/notif', notifRoutes)
app.use('/complaint', complaintsRoutes)

app.listen(process.env.PORT || PORT_BACKEND, function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env)
})
