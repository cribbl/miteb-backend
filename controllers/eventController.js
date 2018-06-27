const admin = require('firebase-admin');
var serviceAccount = require("./../config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mit-clubs-management.firebaseio.com"
});

var ejs = require('ejs');
var pdf = require('html-pdf');
var Excel = require('exceljs');
const moment = require('moment');
const fs = require('fs')

const AD_NAME = "Naranaya Shenoy"
const SO_NAME = "Ashok Rao"

var config = require('../config/config.js');

exports.generate_pdf = function(req,res) {
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
    ejs.renderFile('eventpdf.ejs', {
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
      config.uploadToS3(filename, (err, downloadURL) => {
        if(err) {
          res.status(200).send(err)
          return
        }
        else {
          admin.database().ref('events').child(eventID + '/receiptURL').set(downloadURL)
          res.status(200).send(downloadURL)
          fs.unlink(filename, (err) => {
            if (err) throw err;
            console.log(filename +' was deleted from local server');
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
  
};
//ExcelJS testing
exports.generate_sheet = function(req, res) {
 try {
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet('My Sheet');

        worksheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 32 },
            { header: 'D.O.B.', key: 'DOB', width: 10 }
        ];
        worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});
        worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965,1,7)});

       // Make a file named ask.xlsx in the root directory of the projecet
        workbook.xlsx.writeFile(__dirname + '/ask.xlsx').then(function() {
            console.log('file is written');
            res.sendFile(__dirname + '/ask.xlsx', function(err){
                console.log('---------- error downloading file: ' + err);
            });
        });
    } catch(err) {
        console.log('OOOOOOO this is the error: ' + err);
    }  
};