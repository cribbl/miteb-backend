const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
var cors = require('cors')
var fs = require('fs');
var pdf = require('html-pdf');
var ejs = require('ejs');

// fetchRooms = require('./models/fetchRooms');

var serviceAccount = require("./config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

const ref = admin.database().ref('rooms');

app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.use(express.static('views'));
app.set('views', __dirname)
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


app.get('/', function(req, res, next) {
      res.status(200).send("Hello World!");
});


function datesBetween(start_date, end_date) {
      var start_date = moment(start_date);
      var end_date = moment(end_date);
}


app.get('/login', function(req, res, next) {
  var username = req.query.username
  var password = req.query.password
  
  if(username == "admin" && password == "pass") {
  	var user = {
  	  username: 'admin',
  	  email: 'admin@gmail.com',
  	  displayName: 'Mr. Admin',
  	  phone: '9988776644'
  	};
  	response = {
  		code: 'success',
  		user: user
  	}
    res.status(200).send(response);
  }
  else {
  	response = {
  		code: 'failed',
  		user: null
  	}
    res.status(200).send(response);
  }
});

app.post('/signup', function(req, res, next) {
  var username = req.body.username
  var response = {
    code: '',
    username: ''
  }
  if(username == "admin") {
    response = {
      code: 'failed',
      message: 'Username already exists'
    }
  }
  else if(username == "root") {
    response = {
      code: 'failed',
      message: 'Username not allowed'
    }
  }
  else {
    response = {
      code: 'success',
      message: 'Signup successful'
    }
  }
  
  res.status(200).send(response);
});

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
            res.status(302).send("error");
      })
})

app.post('/send-email', function(req, res) {
  var params = req.body;
  console.log(params);
  var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
          user: '***REMOVED***',
          pass: '***REMOVED***'
      }
  });
  var mailOptions = {
      from: params.senderEmail, // sender address (who sends)
      to: params.to, // list of receivers (who receives)
      subject: params.subject, // Subject line
      text: params.text, // plaintext body
      html: params.html // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
          res.status(302).send(error);
      }
      console.log('Message sent: ' + info.response);
      res.status(200).send(info.response);
  });
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

app.get('/send-otp', function(req,res){
  var userID = req.query.userID;
  var code = Math.floor(100000 + Math.random() * 900000);
  var timestamp = admin.database.ServerValue.TIMESTAMP; // in millisecond

  admin.database().ref('clubs/' + userID).update({
    otp : {
      code : code,
      timestamp : timestamp
    }
  })
  .then(function(){
    response = {
      code : 'success',
      message : 'OTP was generated and stored in database'
    };

    // { } here will come the code to send the OTP via SMS

    res.status(200).send(response);
  })
  .catch(function(error){
    response = {
      code : 'failure',
      message : error
    };
    res.status(200).send(response);
  });
});

app.get('/pdf-receipt', function(req,res){
  // var eventid = req.query.eventID;

  var eventid = "-LDAUHIpM1VHad8MVxaL";
  // var eventid = "-LDIKlEC2c-EkzhX_RpK";
  var eventref = admin.database().ref('events/' + eventid);
  eventref.on("value", function(snapshot) {
    var html;
    // Room selecting logic
    var rooms = snapshot.val().rooms;
    var roomlist = "";
    // determines the academic block according to the first digit as array index
    var room_block = ["AB-1","AB-2","NLH","IC","AB-5"];
    rooms.forEach(function(room){
      var block = Math.floor(room/1000) - 1;
      var room_no = room%1000;
      block = room_block[block];
      roomlist+=block + "-" + room_no + ",";
    });
    roomlist = roomlist.replace(/,\s*$/, "");
    var notes;
    var visibility = "hidden";
    if(snapshot.val().notes)
    {
      notes = snapshot.val().notes;
      visibility = "visible";
    }
    ejs.renderFile('./eventpdf.ejs', {
      club_name : snapshot.val().clubName,
      booker_name : snapshot.val().booker_name,
      booker_contact : snapshot.val().booker_contact,
      booker_reg_no : snapshot.val().booker_reg_no,
      title : snapshot.val().title,
      type : snapshot.val().type,
      start_date : snapshot.val().start_date,
      end_date : snapshot.val().end_date,
      room_list : roomlist,
      isVisible : visibility,
      Notes : notes
    }, function(err, result) {
      // render on success
      if (result) {
         html = result;
      }
      // render or error
      else {
         res.end('An error occurred');
         console.log(err);
      }
  });
    var options = {
      filename: 'event-receipt.pdf',
      height: "842px",
      width: "650px",
      orientation: 'portrait',
      type: "pdf",
      border: "10"
    };

  pdf.create(html, options).toFile(function(err, result) {
      if (err) return console.log(err);
           // console.log(res);
           res.status(200).send(eventid);
      });
  }, function (error) {
     console.log("Error: " + error.code);
});
  
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
