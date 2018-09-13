const admin = require('firebase-admin')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const AWS = require('aws-sdk')
const fs = require('fs')
var cors = require('cors')
var pdf = require('html-pdf')
var ejs = require('ejs')
const axios = require('axios')
const smtpTransport = require('nodemailer-smtp-transport')
// var EmailTemplate = require('email-templates').EmailTemplate;

const sc_uid = 'studentcouncil'
const ad_uid = 'associatedirector'
const so_uid = 'securityofficer'

const img_approved = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fapproved.png?alt=media&token=d8cafb02-d31c-4afc-b940-f793f349e6c2'
const img_flagged = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fflagged.png?alt=media&token=8f8ce92c-3f6a-472f-b323-e86adfdac338'
const img_rejected = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Frejected.png?alt=media&token=cef33f96-768e-43b1-aaa5-bffc27f0fdaf'

exports.send_sms = function (req, res) {
  var params = req.body
  axios.post('https://sfdjt9wg4c.execute-api.us-east-1.amazonaws.com/dev', params)
    .then(function (resp) {
      res.status(200).send('SMS SENT TO ' + req.body.to)
    })
    .catch(function (err) {
      console.log(err)
      res.status(200).send(err)
    })
}

exports.send_otp = function (req, res) {
  // var userID = req.query.userID;
  var userID = 'asdas'
  var contact = req.query.contact
  console.log(req.query)

  console.log(userID + ' ==== ' + contact)

  var code = Math.floor(100000 + Math.random() * 900000)
  var timestamp = new Date().getTime()

  admin.database().ref('otp/' + userID).update({
    code: code,
    timestamp: timestamp
  })
    .then(function () {
      response = {
        code: 'success',
        message: 'OTP was generated and stored in database' + code
      }

      // (contact, code) { } here will come the code to send the OTP via SMS

      res.status(200).send(response)
    })
    .catch(function (error) {
      response = {
        code: 'failure',
        message: error
      }
      res.status(200).send(response)
    })
}

exports.send_email = function (req, res) {
  var params = req.body
  console.log(params)
  var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
      user: 'miteventbooking@gmail.com',
      pass: 'Password@1234'
    }
  }))
  var mailOptions = {
    from: 'miteventbooking@gmail.com', // sender address (who sends)
    to: params.to, // list of receivers (who receives)
    subject: params.subject, // Subject line
    text: params.text, // plaintext body
    html: params.html // html body
  }

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error)
      res.status(302).send(error)
    }
    console.log('Message sent: ' + info.response)
    res.status(200).send(info.response)
  })
}
var img_link
var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: 'miteventbooking@gmail.com',
    pass: 'Password@1234'
  }
}))

exports.sendEventBookingStatusEmailTemplate = function (req, res) {
  console.log(req.query)
  var authority = req.query.authority
  var mode = req.query.mode
  var message = req.query.message
  var club_name = req.query.club_name
  var club_email = req.query.club_email
  var booker_name = req.query.booker_name
  var booker_email = req.query.booker_email
  var event_name = req.query.event_name
  var receipt_url = req.query.receipt_url
  var file
  var image_status
  var subject
  if (mode == 'APPROVED') {
    file = 'approved.ejs'
    image_status = img_approved
    subject = 'Event Approved'
  } else if (mode == 'REJECTED') {
    file = 'rejected.ejs'
    image_status = img_rejected
    subject = 'Event Rejected'
    switch (authority) {
      case 'FA':
        authority = 'Faculty Advisor'
      case 'AD':
        authority = 'Assistant Director'
      case 'SO':
        authority = 'Security Officer'
    }
  } else if (mode == 'FLAGGED') {
    file = 'flagged.ejs'
    image_status = img_flagged
    subject = 'Event Flagged'
    switch (authority) {
      case 'FA':
        authority = 'Faculty Advisor'
      case 'AD':
        authority = 'Assistant Director'
      case 'SO':
        authority = 'Security Officer'
    }
  }
  ejs.renderFile(__dirname + '/../emailTemplates/' + file, {
    club_name: club_name,
    event_name: event_name,
    receipt_link: receipt_url,
    img_status: image_status,
    authority: authority,
    message: message
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('else')

    var mainOptions = {
      from: 'miteventbooking@gmail.com',
      to: [club_email, booker_email],
      subject: subject,
      html: html
    }
    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('Message sent: ' + info.response)
      }
    })
  })
}

exports.sendComplaintEmailTemplate = function (req, res) {
  var booker_name = req.query.booker_name
  var booker_email = req.query.booker_email
  var complaint_subject = req.query.subject
  ejs.renderFile(__dirname + '/../emailTemplates/complaint.ejs', {
    booker_name: booker_name,
    complaint_subject: complaint_subject
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('herh ehrherher')

    var mainOptions = {
      from: 'miteventbooking@gmail.com',
      to: [booker_email],
      subject: 'Complaint Lodging Successful',
      html: html
    }
    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('Message sent: ' + info.response)
      }
    })
  })
}

exports.sendClubApprovalStatusEmailTemplate = function (req, res) {
  var club_name = req.query.club_name
  var club_email = req.query.club_email
  ejs.renderFile(__dirname + '/../emailTemplates/club_approved.ejs', {
    club_name: club_name,
    club_email: club_email
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('else')

    var mainOptions = {
      from: 'miteventbooking@gmail.com',
      to: [club_email],
      subject: 'Club approved',
      html: html
    }
    try {
      transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log('Message sent: ' + info.response)
        }
      })
    } catch (err) {
      console.log('error' + err)
    }
  })
}

exports.send_push = function (req, res) {
  var uid
  var notifResponse = []
  var notifOptions = req.body.notificationOptions
  console.log(notifOptions)
  switch (req.body.uid) {
    case 'SC': uid = sc_uid; break
    case 'AD': uid = ad_uid; break
    case 'SO': uid = so_uid; break
    default: uid = req.body.uid
  }

  admin.database().ref('fcmTokens/' + uid).once('value', function (snapshot) {
    for (let token in snapshot.val()) {
      if (snapshot.val()[token] == true) {
        admin.messaging().sendToDevice(token, notifOptions)
          .then(function (resp) {
          // res.status(200).send(resp)
            console.log(resp)
            notifResponse.push(resp)
          })
          .catch(function (err) {
            console.log('error' + err)
            res.status(302).send('error')
          })
      }
    }
    res.status(200).send(notifResponse)
  })
}

exports.send_push_custom = function (req, res) {
  console.log(req.query)
  var uid
  var notifResponse = []
  let params = {
    uid: req.query.uid,
    notificationOptions: {
      notification: {
        title: 'Reminder',
        body: 'There are pending events. Kindly approve them.',
        icon: 'https://laracasts.com/images/series/circles/do-you-react.png',
        click_action: process.env.NODE_ENV === 'production' ? 'https://prod.cribblservices.com' : ''
      }
    }
  }
  var notifOptions = params.notificationOptions
  console.log(notifOptions)
  switch (req.query.uid) {
    case 'SC': uid = sc_uid; break
    case 'AD': uid = ad_uid; break
    case 'SO': uid = so_uid; break
    default: uid = req.query.uid
  }

  admin.database().ref('fcmTokens/' + uid).once('value', function (snapshot) {
    for (let token in snapshot.val()) {
      if (snapshot.val()[token] == true) {
        admin.messaging().sendToDevice(token, notifOptions)
          .then(function (resp) {
          // res.status(200).send(resp)
            console.log(resp)
            notifResponse.push(resp)
          })
          .catch(function (err) {
            console.log('error' + err)
            res.status(302).send('error')
          })
      }
    }
    res.status(200).send(notifResponse)
  })
}
