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
    accessKeyId: "***REMOVED***",
    secretAccessKey: "***REMOVED***",
});

const s3 = new AWS.S3();
const bucketName = 'miteb'

app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ad_uid = "DAAhD2EBqvQujYGITPAdBfZtZEH3";
const so_uid = "raMsWfP6m9dlNl6T6k7jTnfGlxG3";

app.get('/', function(req, res, next) {
      res.status(200).send("Hello World!");
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
          console.log(`downloadURL : https://s3.amazonaws.com/${bucketName}/sample.pdf`);
          res.status(200).send(data)
        }
      })
    }
  })
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

app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});