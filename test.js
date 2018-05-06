const moment = require('moment');
const express = require('express');
const firebase = require('firebase');
// fetchRooms = require('./models/fetchRooms');

// http://localhost:3001/fetch_rooms?start_date=2018-03-10T16:33:36-05:30&end_date=2018-03-12T16:33:36-05:30

var config = {
    apiKey: "AIzaSyAhKIXmaPGeHw_7hX9qfjGecaLCGsLDn4g",
    authDomain: "mit-clubs-management.firebaseapp.com",
    databaseURL: "https://mit-clubs-management.firebaseio.com",
    projectId: ***REMOVED***,
    storageBucket: "mit-clubs-management.appspot.com",
    messagingSenderId: "330445707440"
  };

firebase.initializeApp(config);

const firebaseDB = firebase.database();

app = express()

app.get('/', function(req, res) {
      res.send('Hello world!');
});

function datesBetween(start_date, end_date) {
      var start_date = moment(start_date);
      var end_date = moment(end_date);
}

app.get('/fetch_rooms/', function(req, res) {
      // var start_date = String(req.query.start_date);
      // var end_date = String(req.query.end_date);


      var date = moment().format('DD-MM-YYYY');
      var end_date = moment().add(2, 'days').format('DD-MM-YYYY');

      // res.setHeader('Content-Type', 'text/plain');
      console.log(date);
      firebaseDB.ref('/rooms/').on('value',
      	function(snapshot) {
        	console.log('snapshot')	
        	console.log(snapshot)
        })
      console.log('done');
});


app.listen(3001);
console.log('running');

// var room_arr = {
//       "3101" : false,
//       "3102" : false,
//       "3103" : false,
//       "3104" : false,
//       "3105" : false,
//       "3201" : false,
//       "3202" : false,
//       "3203" : false,
//       "3204" : false,
//       "3205" : false,
//       "3301" : false,
//       "3302" : false,
//       "3303" : false,
//       "3304" : false,
//       "3305" : false,
//       "3401" : false,
//       "3402" : false,
//       "3403" : false,
//       "3404" : false,
//       "3405" : false,
//       "5201" : false,
//       "5202" : false,
//       "5203" : false,
//       "5204" : false,
//       "5205" : false,
//       "5206" : false,
//       "5207" : false,
//       "5208" : false,
//       "5209" : false,
//       "5210" : false,
//       "5301" : false,
//       "5302" : false,
//       "5303" : false,
//       "5304" : false,
//       "5305" : false,
//       "5306" : false,
//       "5307" : false,
//       "5308" : false,
//       "5309" : false,
//       "5310" : false
//     };

// var today = moment().format('DD-MM-YYYY');
// var yesterday = moment().add(-1, 'days').format('DD-MM-YYYY');

// exports.helloWorld = functions.https.onRequest((request, response) => {
// 	ref.child(today).set(room_arr)
// 		.then(res => {
// 	 		response.send('Entered at /rooms in db');
// 		})
// 		.catch(err => {
// 			response.send(err);
// 		});

// 	ref.child(yesterday).set(null)
// 		.then(res => {
// 	 		response.send('Removed from /rooms in db');
// 		})
// 		.catch(err => {
// 			response.send(err);
// 		});
//  });
