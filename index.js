const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const AWS = require('aws-sdk')
const fs = require('fs')
var cors = require('cors')
const base_url = "dev-miteventbooking.herokuapp.com";

// fetchRooms = require('./models/fetchRooms');

var serviceAccount = require("./config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

const ref = admin.database();

AWS.config.update({
    accessKeyId: "AKIAIY33FTVXMWKDA2SA",
    secretAccessKey: "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",
});

const s3 = new AWS.S3();
const bucketName = 'miteb'

app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ad_uid = "DAAhD2EBqvQujYGITPAdBfZtZEH3";
const so_uid = "raMsWfP6m9dlNl6T6k7jTnfGlxG3";

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

app.post('/send-notif', function(req, res, next) {
      // var uid = String(req.body.uid);
      var uid;
      var notifResponse=[];
      var notifOptions = req.body.notificationOptions;
      console.log(notifOptions)
      switch(req.body.uid) {
              case "AD": uid = ad_uid; break;
              case "SO": uid = so_uid; break;
              default: uid = req.body.uid;
            }

      admin.database().ref('fcmTokens/' + uid).once('value', function(snapshot) {
        for(let token in snapshot.val()) {
          if(snapshot.val()[token] == true) {
            admin.messaging().sendToDevice(token, notifOptions)
            .then(function(resp) {
              // res.status(200).send(resp)
              console.log(resp)
              notifResponse.push(resp);
            })
            .catch(function(err) {
              console.log("error" + err);
              res.status(302).send("error");
            })
          }
        }
        res.status(200).send(notifResponse)
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
          user: 'miteventbooking@gmail.com',
          pass: 'Password@1234'
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
    password: "Password@1234"
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


app.get('/upload', function(req, res) {
  fs.readFile('./sample.pdf', function(err, data) {
    if(err) {
      console.log(err)
      res.status(200).send(err)
    }
    else {
      console.log(data)
      let params = {Bucket: bucketName, Key: "sample.pdf", Body: data}
      s3.putObject(params, function(err, data) {
        if(err) {
          console.log("error")
          res.status(200).send(err)
        }
        else {
          console.log("uploaded succcessfully")
          res.status(200).send(data)
        }
      })
    }
  })
});

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

app.get('/send-otp', function(req,res) {
  var userID = req.query.userID;
  var contact = req.query.contact;
  console.log(req.query);

  console.log(userID + " ==== " + contact)

  var code = Math.floor(100000 + Math.random() * 900000);
  var timestamp = new Date().getTime();

  admin.database().ref('otp/' + userID).update({
      code : code,
      timestamp : timestamp
  })
  .then(function(){
    response = {
      code : 'success',
      message : 'OTP was generated and stored in database' + code
    };

    // (contact, code) { } here will come the code to send the OTP via SMS

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

var room_arr = {
  "3101" : false,
  "3102" : false,
  "3103" : false,
  "3104" : false,
  "3105" : false,
  "3201" : false,
  "3202" : false,
  "3203" : false,
  "3204" : false,
  "3205" : false,
  "3301" : false,
  "3302" : false,
  "3303" : false,
  "3304" : false,
  "3305" : false,
  "3401" : false,
  "3402" : false,
  "3403" : false,
  "3404" : false,
  "3405" : false,
  "5201" : false,
  "5202" : false,
  "5203" : false,
  "5204" : false,
  "5205" : false,
  "5206" : false,
  "5207" : false,
  "5208" : false,
  "5209" : false,
  "5210" : false,
  "5301" : false,
  "5302" : false,
  "5303" : false,
  "5304" : false,
  "5305" : false,
  "5306" : false,
  "5307" : false,
  "5308" : false,
  "5309" : false,
  "5310" : false
};


// Cron-job function for inserting new date
app.get('/cron-room', function (req, res) {

  var today = moment().format('DD-MM-YYYY');
  var yesterday = moment().add(-1, 'days').format('DD-MM-YYYY');
  var futureDate = moment().add(1, 'days').add(1, 'months').format('DD-MM-YYYY'); // stores date as today's date and month is incremented by 1

  ref.child(futureDate).set(room_arr, function(err) {
    if(err) {
			response = {
			 code: 'failure',
			 message: err
			}
		  res.status(200).send("error in 1st func : " + response);
		  return;
		}

    ref.child(today).set(room_arr, function(err) {
      if(err) {
        response = {
          code: 'failure',
          message: err
        }
        res.status(200).send("error in 2nd func : " + response);
        return;
		  }

      ref.child(yesterday).set(null, function(err) {
        if(err) {
          response = {
            code: 'failure',
            message: err
          }
          res.status(200).send("error in 3rd func : " + response);
          return;
        }
        else {
          response = {
            code: 'success',
            message: "room-array updated for :" + futureDate
          }
          res.status(200).send("Success: " + response);
        }
			});
		});
	});
});

app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});