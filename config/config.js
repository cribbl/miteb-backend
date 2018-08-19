const AWS = require('aws-sdk')
const fs = require('fs')
AWS.config.update({
    accessKeyId: "***REMOVED***",
    secretAccessKey: "***REMOVED***",
});

const admin = require('firebase-admin');
var serviceAccount = process.env.NODE_ENV == 'production' ? require("./../config.json") : require("./../config-development.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.NODE_ENV == 'production' ? "https://staging-mit-event-booking.firebaseio.com" : "https://mit-clubs-management.firebaseio.com"
});

const s3 = new AWS.S3();
const bucketName = 'miteb'

exports.uploadToS3 = function(filename, callback) {
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
};