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
// var EmailTemplate = require('email-templates').EmailTemplate;
const sc_uid = "9xdTvUjqtuYI5yYOJ4BbhsPAIyx2";
const ad_uid = "DAAhD2EBqvQujYGITPAdBfZtZEH3";
const so_uid = "raMsWfP6m9dlNl6T6k7jTnfGlxG3";
const img_approved = "https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fapproved.png?alt=media&token=d8cafb02-d31c-4afc-b940-f793f349e6c2";
const img_flagged = "https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fflagged.png?alt=media&token=8f8ce92c-3f6a-472f-b323-e86adfdac338";
const img_rejected = "https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Frejected.png?alt=media&token=cef33f96-768e-43b1-aaa5-bffc27f0fdaf";

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


// exports.send_email = function(req, res) {
//   var params = req.body;
//   console.log(params);
//   var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'gmail',
//     auth: {
//         user: 'miteventbooking@gmail.com',
//         pass: 'Password@1234'
//     }
//   }));
//   var mailOptions = {
//     from: 'miteventbooking@gmail.com', // sender address (who sends)
//     to: params.to, // list of receivers (who receives)
//     subject: params.subject, // Subject line
//     text: params.text, // plaintext body
//     html: params.html // html body
//   };

//   // send mail with defined transport object
//   transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//       return console.log(error);
//       res.status(302).send(error);
//     }
//     console.log('Message sent: ' + info.response);
//     res.status(200).send(info.response);
//   });
// };
var img_link;
  var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'miteventbooking@gmail.com',
        pass: 'Password@1234'
    }
  }));
exports.send_email = function(req, res) {
  console.log(__dirname);
  var mode = req.query.mode;
  var club_name = req.query.club_name;
  var event_name = req.query.event_name;
  var club_mail = req.query.club_mail;
  var receipt_url;
  var file;
  var image_status;
  var authority;
  var message;
  if(mode == 'Approved') {
    file = 'approved.ejs';
    image_status = img_approved;
    receipt_url = req.query.receipt_url;
    // receipt_url = 'https://s3.amazonaws.com/miteb/-LD8H1FvjaD6m-qHdr_P.pdf'
  }
  else if(mode == 'Rejected') {
    file = 'rejected.ejs';
    image_status = img_rejected;
    authority = req.query.authority;
    switch(authority) {
      case 'FA':
        // message = FA_msg;
        message = 'some random message FA';
      case 'AD':
        // message = AD_msg;
        message = 'some random message AD';
      case 'SO':
        // message = SO_msg;
        message = 'some random message SO';
    }
  }
  else if(mode == 'Flagged') {
    file = 'flagged.ejs';
    image_status = img_flagged;
    authority = req.query.authority;
    switch(authority) {
      case 'FA':
        // message = FA_msg;
        message = 'some random message FA';
        break;
      case 'AD':
        // message = AD_msg;
        message = 'some random message AD';
        break;
      case 'SO':
        // message = SO_msg;
        message = 'some random message SO';
        break;
    }
  }
  ejs.renderFile(__dirname + '/../emailTemplates/' + file, {
    club_name: club_name,
    event_name: event_name,
    receipt_link: receipt_url,
    img_status: image_status,
    authority: authority,
    message: message
  }, function(err, html) {
    if(err) {
      console.log(err);
      return;
    }
    console.log('else')
    
    var mainOptions = {
        from: 'miteventbooking@gmail.com',
        // to: club_mail
        to: 'priyamagrawal2208@gmail.com',
        subject: 'Hello, world',
        html: html
    };
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

  })
}

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