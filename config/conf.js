const admin = require('firebase-admin');
var ejs = require('ejs');
const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const AWS = require('aws-sdk')
const fs = require('fs')
var cors = require('cors')
var pdf = require('html-pdf');

app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(express.static('views'));
app.set('views', __dirname)

var serviceAccount = require("../config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

AWS.config.update({
    accessKeyId: "AKIAIWXHQYTV6HV7KMKA",
    secretAccessKey: "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",
});
