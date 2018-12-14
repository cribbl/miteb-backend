const admin = require('firebase-admin')
const nodemailer = require('nodemailer')
const path = require('path')
var ejs = require('ejs')
const axios = require('axios')
const smtpTransport = require('nodemailer-smtp-transport')
// var EmailTemplate = require('email-templates').EmailTemplate;

const scUID = 'studentcouncil'
const adUID = 'associatedirector'
const soUID = 'securityofficer'

const imgApproved = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fapproved.png?alt=media&token=d8cafb02-d31c-4afc-b940-f793f349e6c2'
const imgFlagged = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Fflagged.png?alt=media&token=8f8ce92c-3f6a-472f-b323-e86adfdac338'
const imgRejected = 'https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/mail%2Frejected.png?alt=media&token=cef33f96-768e-43b1-aaa5-bffc27f0fdaf'

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
      let response = {
        code: 'success',
        message: 'OTP was generated and stored in database' + code
      }

      // (contact, code) { } here will come the code to send the OTP via SMS

      res.status(200).send(response)
    })
    .catch(function (error) {
      let response = {
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
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASSWORD
    }
  }))
  var mailOptions = {
    from: process.env.SENDER_EMAIL, // sender address (who sends)
    to: params.to, // list of receivers (who receives)
    subject: params.subject, // Subject line
    text: params.text, // plaintext body
    html: params.html // html body
  }

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(302).send(error)
      return console.log(error)
    }
    console.log('Message sent: ' + info.response)
    res.status(200).send(info.response)
  })
}

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD
  }
}))

exports.sendEventBookingStatusEmailTemplate = function (req, res) {
  console.log(req.query)
  var authority = req.query.authority
  var mode = req.query.mode
  var message = req.query.message
  var clubName = req.query.club_name
  var clubEmail = req.query.club_email
  // var bookerName = req.query.booker_name
  var bookerEmail = req.query.booker_email
  var eventName = req.query.event_name
  var receiptUrl = req.query.receipt_url
  var file
  var imageStatus
  var subject
  if (mode === 'APPROVED') {
    file = 'approved.ejs'
    imageStatus = imgApproved
    subject = 'Event Approved'
  } else if (mode === 'REJECTED') {
    file = 'rejected.ejs'
    imageStatus = imgRejected
    subject = 'Event Rejected'
    switch (authority) {
      case 'FA':
        authority = 'Faculty Advisor'
        break
      case 'AD':
        authority = 'Assistant Director'
        break
      case 'SO':
        authority = 'Security Officer'
    }
  } else if (mode === 'FLAGGED') {
    file = 'flagged.ejs'
    imageStatus = imgFlagged
    subject = 'Event Flagged'
    switch (authority) {
      case 'FA':
        authority = 'Faculty Advisor'
        break
      case 'AD':
        authority = 'Assistant Director'
        break
      case 'SO':
        authority = 'Security Officer'
    }
  }
  ejs.renderFile(path.join(__dirname, '/../emailTemplates/', file), {
    club_name: clubName,
    event_name: eventName,
    receipt_link: receiptUrl,
    img_status: imageStatus,
    authority: authority,
    message: message
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('else')

    var mainOptions = {
      from: process.env.SENDER_EMAIL,
      to: [clubEmail, bookerEmail],
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
  var bookerName = req.query.booker_name
  var bookerEmail = req.query.booker_email
  var complaintSubject = req.query.subject
  ejs.renderFile(path.join(__dirname, '/../emailTemplates/complaint.ejs'), {
    booker_name: bookerName,
    complaint_subject: complaintSubject
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('herh ehrherher')

    var mainOptions = {
      from: process.env.SENDER_EMAIL,
      to: [bookerEmail],
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
  var clubName = req.query.club_name
  var clubEmail = req.query.club_email
  ejs.renderFile(path.join(__dirname, '/../emailTemplates/club_approved.ejs'), {
    club_name: clubName,
    club_email: clubEmail
  }, function (err, html) {
    if (err) {
      console.log(err)
      return
    }
    console.log('else')

    var mainOptions = {
      from: process.env.SENDER_EMAIL,
      to: [clubEmail],
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
    case 'SC': uid = scUID; break
    case 'AD': uid = adUID; break
    case 'SO': uid = soUID; break
    default: uid = req.body.uid
  }

  admin.database().ref('fcmTokens/' + uid).once('value', function (snapshot) {
    for (let token in snapshot.val()) {
      if (snapshot.val()[token] === true) {
        admin.messaging().sendToDevice(token, notifOptions)
          .then(function (resp) {
          // res.status(200).send(resp)
            console.log(resp)
            notifResponse.push(resp)
          })
          .catch(function (err) {
            console.log('error' + err)
            // res.status(302).send('error')
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
    case 'SC': uid = scUID; break
    case 'AD': uid = adUID; break
    case 'SO': uid = soUID; break
    default: uid = req.query.uid
  }

  admin.database().ref('fcmTokens/' + uid).once('value', function (snapshot) {
    for (let token in snapshot.val()) {
      if (snapshot.val()[token] === true) {
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
