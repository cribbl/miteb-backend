const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');

// fetchRooms = require('./models/fetchRooms');

var serviceAccount = require("./config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

const ref = admin.database().ref('rooms');

app = express();

app.get('/', function(req, res) {
      res.status(200).send("Hello World!");
});


function datesBetween(start_date, end_date) {
      var start_date = moment(start_date);
      var end_date = moment(end_date);
}

app.get('/send-notif', function(req, res) {
      var token = String(req.query.token);
      var payload = req.query.payload;
      console.log(payload);

      admin.messaging().sendToDevice(token, payload)
      .then(function(resp) {
            console.log("sent" + resp);
            res.status(200).send("sent")
      })
      .catch(function(err) {
            console.log("error" + err);
            res.status(302).send("error") 
      })
})

app.get('/update-user', function(req, res) {
  // var uid = String(req.query.uid);
  uid = "z8sTDxIHeVZhorxqcFxe4j6fvRp2";
  // var newinfo = req.query.newinfo;
  // console.log(newinfo);
  
  var newinfox = {
    email: "dummymitfa@gmail.com",
    emailVerified: true,
    password: "***REMOVED***"
  }

  admin.auth().updateUser(uid, newinfox)
    .then(function(userRecord) {
      console.log("Successfully updated user", userRecord.toJSON());
      res.status(200).send("Successfully updated user", userRecord.toJSON())
    })
    .catch(function(error) {
      console.log("Error updating user:", error);
      res.status(302).send("Error updating user:", error);
    });
})

app.get('/fetch_rooms/', function(req, res) {
      var start_date = String(req.query.start_date);
      var end_date = String(req.query.end_date);

      var date = start_date;

      res.setHeader('Content-Type', 'text/plain');

      res.write(start_date);
      res.write(end_date);
      res.write(date);

      while(date != end_date) {
            date = moment(date).add(1, 'days').format('DD-MM-YYYY');
            res.write(date);
            ref.child(date).once('value')
                  .then(function(snapshot) {
                        res.write(snapshot);
                  })
                  .catch(err => {
                        res.write(err);
                  });
      }
      res.status(200).send("done");
});

const api = functions.https.onRequest(app);


module.exports = {
      api
}

app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

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
//  ref.child(today).set(room_arr)
//    .then(res => {
//      response.send('Entered at /rooms in db');
//    })
//    .catch(err => {
//      response.send(err);
//    });

//  ref.child(yesterday).set(null)
//    .then(res => {
//      response.send('Removed from /rooms in db');
//    })
//    .catch(err => {
//      response.send(err);
//    });
//  });
