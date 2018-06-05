const admin = require('firebase-admin');
const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const fs = require('fs')
var cors = require('cors')
const config = require('../config/conf');

exports.send_notif = function(req,res){
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
};

exports.send_email = function(req, res) {
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
};