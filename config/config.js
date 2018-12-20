const AWS = require('aws-sdk')
const fs = require('fs')
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const s3 = new AWS.S3()
const bucketName = 'miteb'

exports.uploadToS3 = function (filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      console.log('error while reading', err)
      callback(err)
    } else {
      let params = { Bucket: bucketName, Key: filename, Body: data }
      s3.putObject(params, function (err, data) {
        if (err) {
          console.log('error' + err)
          callback(err)
        } else {
          console.log('uploaded succcessfully')
          let downloadURL = `https://s3.amazonaws.com/${bucketName}/${filename}`
          callback(null, downloadURL)
        }
      })
    }
  })
}
