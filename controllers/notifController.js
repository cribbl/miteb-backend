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

const sc_uid = "9xdTvUjqtuYI5yYOJ4BbhsPAIyx2";
const ad_uid = "DAAhD2EBqvQujYGITPAdBfZtZEH3";
const so_uid = "raMsWfP6m9dlNl6T6k7jTnfGlxG3";

exports.send_otp = function(req,res) {
  // var userID = req.query.userID;
  var userID = 'asdas';
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
};


exports.send_email = function(req, res) {
  var params = req.body;
  console.log(params);
  var transporter = nodemailer.createTransport(smtpTransport({
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
};

exports.send_push = function(req, res) {
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
};