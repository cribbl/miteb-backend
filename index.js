const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const AWS = require('aws-sdk')
const fs = require('fs')
var cors = require('cors')
var pdf = require('html-pdf');
var ejs = require('ejs');
const smtpTransport = require('nodemailer-smtp-transport')

var serviceAccount = require("./config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

const AD_NAME = "Naranaya Shenoy"
const SO_NAME = "Ashok Rao"
const ref = admin.database();

AWS.config.update({
    accessKeyId: "AKIAIWXHQYTV6HV7KMKA",
    secretAccessKey: "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",
});
const s3 = new AWS.S3();
const bucketName = 'miteb'

app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.use(express.static('views'));
app.set('views', __dirname)

const sc_uid = "9xdTvUjqtuYI5yYOJ4BbhsPAIyx2";
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
    case "SC": uid = sc_uid; break;
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
  var transporter = nodemailer.createTransport(smtpTransport({
    // host: 'smtp.gmail.com',
    // port: 465,
    // secure: true, // use SSL
    service: 'gmail',
    auth: {
        user: 'miteventbooking@gmail.com',
        pass: 'Password@1234'
    }
  }));
  var mailOptions = {
    from: 'miteventbooking@gmail.com', // sender address (who sends)
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

var uploadToS3 = function(filename, callback) {
  fs.readFile(filename, function(err, data) {
    if(err) {
      console.log("error while reading", err)
      callback(err)
    }
    else {
      let params = {Bucket: bucketName, Key: filename, Body: data}
      s3.putObject(params, function(err, data) {
        if(err) {
          console.log("error" + err)
          callback(err)
          return
        }
        else {
          console.log("uploaded succcessfully")
          downloadURL = `https://s3.amazonaws.com/${bucketName}/${filename}`;
          callback(null, downloadURL)
          return
        }
      })
    }
  })
}

app.get('/generate-pdf', function(req,res) {
  var eventID = req.query.eventID;
  var filename = `${eventID}.pdf`

  var eventref = admin.database().ref('events/' + eventID);
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
      roomlist+=block + "-" + room_no + ", ";
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
      club_name: snapshot.val().clubName,
      booker_name: snapshot.val().booker_name,
      booker_contact: snapshot.val().booker_contact,
      booker_reg_no: snapshot.val().booker_reg_no,
      title: snapshot.val().title,
      type: snapshot.val().type,
      start_date: moment(snapshot.val().start_date, 'DD-MM-YYYY').format("dddd, DD MMM YYYY"),
      end_date: moment(snapshot.val().end_date, 'DD-MM-YYYY').format("dddd, DD MMM YYYY"),
      room_list: roomlist,
      isVisible: visibility,
      Notes: notes,
      fa_name: snapshot.val().FA_name,
      ad_name: AD_NAME,
      so_name: SO_NAME,
      fa_date: snapshot.val().FA_date,
      ad_date: snapshot.val().AD_date,
      so_date: snapshot.val().SO_date,
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
      filename: filename,
      height: "870px",
      width: "650px",
      orientation: 'portrait',
      type: "pdf",
      timeout: '30000',
      border: "10",
    };

  pdf.create(html, options).toFile(function(err, result) {
    if (err) {
      console.log(err);
    }
    else {
      uploadToS3(filename, (err, downloadURL) => {
        if(err) {
          res.status(200).send(err)
          return
        }
        else {
          admin.database().ref('events').child(eventID + '/receiptURL').set(downloadURL)
          res.status(200).send(downloadURL)
          fs.unlink(filename, (err) => {
            if (err) throw err;
            console.log(filename +' was deleted');
          });
          return
        }

      })
    }
  });
  },
  function (error) {
     console.log("Error: " + error.code);
});
  
});

app.post('/signup', function(req, res) {
  var newUser = req.body;
  admin.auth().createUser({
    uid: newUser.name.replace(/\s/g,''),
    email: newUser.email,
    password: newUser.password,
  })
  .then(function(user) {
    newUser['uid'] = user.uid;
    newUser['isApproved'] = false;
    newUser['isClub'] = true,
    newUser['isFA'] = false,
    newUser['notificationSettings'] = {
      email: 1,
      sms: 0
    }
    admin.database().ref('clubs/').child(user.uid).set(newUser);
    res.status(200).send({state: 'success', res: newUser});
  })
  .catch(function(err) {
    console.log(err.errorInfo);
    res.status(200).send({state: 'fail', err: err.errorInfo});
  })

})

const api = functions.https.onRequest(app);


module.exports = {
      api
}

app.listen(process.env.PORT || 9000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});