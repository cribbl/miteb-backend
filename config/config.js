const UUID = require("uuid-v4");
const admin = require('firebase-admin')
// var serviceAccount = process.env.NODE_ENV === 'production' ? require('./../config.production.json') : require('./../config.development.json')
var serviceAccount = require(process.env.PATH_TO_FIREBASE_CONFIG)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

var bucket = admin.storage().bucket()

exports.uploadToFirebase = function (filename, filePath, callback) {

  let uuid = UUID();

  bucket.upload(`./${filename}`, {
    destination: `${filePath}/${filename}`,
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
      metadata: {
        firebaseStorageDownloadTokens: uuid
      }
    }
  }).then((data) => {
    console.log('uploaded succcessfully')
    let file = data[0];
    let downloadURL = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
    callback(null, downloadURL)
  }).catch(err => {
    console.log('error' + err)
    callback(err)
  })
}