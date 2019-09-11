const admin = require('firebase-admin')

var ejs = require('ejs')
var pdf = require('html-pdf')
var Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

const AD_NAME = 'Narayana Shenoy'
const SO_NAME = 'Ashok Rao'

var config = require('../config/config.js')

function getRoomList (rooms) {
  let roomlist = ''
  // determines the academic block according to the first digit as array index
  var roomBlock = ['AB-1', 'AB-2', 'NLH', 'IC', 'AB-5']
  rooms.forEach(function (room) {
    let block
    let roomNo

    if (room === 53101 || room === 53102) {
      block = roomBlock[4]
      roomNo = room === 53101 ? '310A' : '310B'
    } else {
      block = Math.floor(room / 1000) - 1
      roomNo = room % 1000
      block = roomBlock[block]
    }
    roomlist += block + '-' + roomNo + ', '
  })
  roomlist = roomlist.replace(/,\s*$/, '')
  return roomlist
}
exports.generate_pdf = function (req, res) {
  var eventID = req.query.eventID
  var filename = `${eventID}.pdf`
  var filePath = 'receipts'

  var eventref = admin.database().ref('events/' + eventID)
  eventref.once('value', function (snapshot) {
    var html
    // Room selecting logic
    let roomList = getRoomList(snapshot.val().rooms)
    var notes
    var visibility = 'hidden'
    if (snapshot.val().notes) {
      notes = snapshot.val().notes
      visibility = 'visible'
    }
    var clubRef = admin.database().ref('users/' + snapshot.val().clubID)
    clubRef.once('value', function (clubSnapshot) {
      var profilePicURL = clubSnapshot.val().profilePicURL
      ejs.renderFile(path.join(__dirname, '/eventpdf.ejs'), {
        event_id: eventID,
        club_name: snapshot.val().clubName,
        booker_name: snapshot.val().booker_name,
        booker_contact: snapshot.val().booker_contact,
        booker_reg_no: snapshot.val().booker_reg_no,
        title: snapshot.val().title,
        type: snapshot.val().type,
        startDate: moment(snapshot.val().startDate, 'DD-MM-YYYY').format('dddd, DD MMM YYYY'),
        endDate: moment(snapshot.val().endDate, 'DD-MM-YYYY').format('dddd, DD MMM YYYY'),
        start_time: snapshot.val().start_time,
        end_time: snapshot.val().end_time,
        room_list: roomList,
        isVisible: visibility,
        Notes: notes,
        fa_name: snapshot.val().FA_name,
        ad_name: AD_NAME,
        so_name: SO_NAME,
        fa_date: snapshot.val().FA_date,
        ad_date: snapshot.val().AD_date,
        so_date: snapshot.val().SO_date,
        club_logo: profilePicURL
      }, function (err, result) {
        if (result) {
          html = result
        } else {
          res.end('An error occurred')
          console.log(err)
        }
      })
      var options = {
        filename: filename,
        height: '870px',
        width: '650px',
        orientation: 'portrait',
        type: 'pdf',
        timeout: '30000',
        border: '10'
      }

      pdf.create(html, options).toFile(function (err, result) {
        if (err) {
          console.log(err)
        } else {
          config.uploadToFirebase(filename, filePath, (err, downloadURL) => {
            if (err) {
              res.status(200).send(err)
            } else {
              admin.database().ref('events').child(eventID + '/receiptURL').set(downloadURL)
              fs.unlink(filename, (err) => {
                if (err) throw err
                console.log(filename + ' was deleted from local server')
              })
              res.status(200).send(downloadURL)
            }
          })
        }
      })
    })
  },
  function (error) {
    console.log('Error: ' + error.code)
  })
}

exports.generate_daily_events = function (req, res) {
  function snapshotToArray (snapshot) {
    var returnArr = []

    snapshot.forEach(function (childSnapshot) {
      var item = childSnapshot.val()
      returnArr.push(item)
    })

    return returnArr
  }
  var date = req.query.date
  var filename = path.join(__dirname, `events-${date}.pdf`)
  console.log(date)
  var eventsRef = admin.database().ref('to-be-held/' + date)
  var eventRef = admin.database().ref()
  eventsRef.once('value', async function (snapshot) {
    var html
    var eventIDs = snapshotToArray(snapshot)
    var eventCount = eventIDs.length
    if (eventCount === 0) {
      console.log('No events booked for this day')
      res.status(200).send('No Events Booked')
    } else {
      let roomlist
      // TODO: A lot of db calls being made here.Fix this.
      let snapshots = await Promise.all(eventIDs.map((id) => {
        return eventRef.child('events/' + id).once('value')
      }))

      let eventArr = snapshots.map((snapshot) => {
        let rooms = snapshot.child('rooms/').val()
        roomlist = getRoomList(rooms)
        let eventObj = []
        eventObj.push(snapshot.key)
        eventObj.push(snapshot.val().clubName)
        eventObj.push(roomlist)
        return eventObj
      })
      console.log(eventArr)

      ejs.renderFile(path.join(__dirname, '/dailyeventpdf.ejs'), {
        events: eventArr,
        date: date
      }, function (err, result) {
        if (result) {
          html = result
        } else {
          res.end('An error occurred')
          console.log(err)
        }
      })
      var options = {
        filename: filename,
        height: '870px',
        width: '650px',
        orientation: 'portrait',
        type: 'pdf',
        timeout: '30000',
        border: '10'
      }

      pdf.create(html, options).toFile(function (err, result) {
        if (err) {
          console.log(err)
        } else {
          res.download(path.join(filename), function (err, result) {
            if (err) {
              console.log('Error downloading file: ' + err)
            } else {
              console.log('File downloaded successfully')
              fs.unlink(filename, (err) => {
                if (err) throw err
                console.log(filename + ' was deleted from local server')
              })
            }
          })
        }
      })
    }
  })
}

exports.generate_sheet = function (req, res) {
  function snapshotToArray (snapshot) {
    var returnArr = []
    snapshot.forEach(function (childSnapshot) {
      var item = childSnapshot.val()
      item.key = childSnapshot.key

      returnArr.push(item)
    })

    return returnArr
  }
  try {
    var months = ['January', 'Feburary', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December']
    var clubID = req.query.uid
    var typeEvent
    var eventId
    var title
    var sdate
    var edate
    var roomlist
    var bookerName
    var workbook = new Excel.Workbook()
    var type = req.query.mode
    var clubRef = admin.database().ref()
    if (type === 'CUSTOM') {
      var d1 = req.query.from
      var d2 = req.query.to
      var worksheet = workbook.addWorksheet('Event Details')

      worksheet.columns = [
        { header: 'Event ID', key: 'event_id', width: 25 },
        { header: 'Type', key: 'type_event', width: 10 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Start Date', key: 'sdate', width: 25 },
        { header: 'End Date', key: 'edate', width: 25 },
        { header: 'Rooms', key: 'roomlist', width: 25 },
        { header: 'Booked By', key: 'booker_name', width: 15 }
      ]
      var eventID
      clubRef.child('users/' + clubID + '/my_events').once('value', function (snapshot) {
        eventID = snapshotToArray(snapshot)
        var eventCount = eventID.length
        var i = 0
        eventID.forEach(function (element) {
          clubRef.child('events/' + element).once('value', function (snapshot) {
            sdate = snapshot.child('startDate').val()
            edate = snapshot.child('endDate').val()
            var t1 = moment(d1, 'DD-MM-YYYY')
            var t2 = moment(d2, 'DD-MM-YYYY')
            var t3 = moment(sdate, 'DD-MM-YYYY')
            var t4 = moment(edate, 'DD-MM-YYYY')
            if (moment(t1).isSameOrBefore(t3) && moment(t2).isSameOrAfter(t4)) {
              eventId = element
              typeEvent = snapshot.child('type').val()
              sdate = t3.format('dddd, Do MMMM YYYY')
              edate = t4.format('dddd, Do MMMM YYYY')
              title = snapshot.child('title').val()
              var rooms = snapshot.child('rooms/').val()
              roomlist = getRoomList(rooms)
              bookerName = snapshot.child('booker_name').val()
              worksheet.addRow({
                event_id: eventId,
                type_event: typeEvent,
                title: title,
                sdate: sdate,
                edate: edate,
                roomlist: roomlist,
                booker_name: bookerName
              })
            }
            i += 1
            if (i === eventCount) {
              workbook.xlsx.writeFile(path.join(__dirname, '/eventDetails.xlsx')).then(function () {
                console.log('file is written')
                res.download(path.join(__dirname, '/eventDetails.xlsx'), function (err, result) {
                  if (err) {
                    console.log('Error downloading file: ' + err)
                  } else {
                    console.log('File downloaded successfully')
                  }
                })
              })
            }
          })
        })
      })
    } else if (type === 'ALL') {
      console.log('extract monthly')
      clubRef.child('users/' + clubID + '/my_events').once('value', function (snapshot) {
        eventID = snapshotToArray(snapshot)
        var eventCount = eventID.length
        var i = 0
        eventID.forEach(function (element) {
          clubRef.child('events/' + element).once('value', function (snapshot) {
            sdate = snapshot.child('startDate').val()
            edate = snapshot.child('endDate').val()
            var t1 = moment(sdate, 'DD-MM-YYYY')
            var t2 = moment(edate, 'DD-MM-YYYY')
            var mon = t1.month()
            let worksheet
            if (workbook.getWorksheet(months[mon])) {
              worksheet = workbook.getWorksheet(months[mon])
            } else {
              worksheet = workbook.addWorksheet(months[mon])
            }
            worksheet.columns = [
              { header: 'Event ID', key: 'event_id', width: 25 },
              { header: 'Type', key: 'type_event', width: 10 },
              { header: 'Title', key: 'title', width: 25 },
              { header: 'Start Date', key: 'sdate', width: 25 },
              { header: 'End Date', key: 'edate', width: 25 },
              { header: 'Rooms', key: 'roomlist', width: 25 },
              { header: 'Booked By', key: 'booker_name', width: 15 }
            ]
            eventId = element
            typeEvent = snapshot.child('type').val()
            sdate = t1.format('dddd, Do MMMM YYYY')
            edate = t2.format('dddd, Do MMMM YYYY')
            title = snapshot.child('title').val()
            var rooms = snapshot.child('rooms/').val()
            roomlist = getRoomList(rooms)
            bookerName = snapshot.child('booker_name').val()
            worksheet.addRow({
              event_id: eventId,
              type_event: typeEvent,
              title: title,
              sdate: sdate,
              edate: edate,
              roomlist: roomlist,
              booker_name: bookerName
            })
            i += 1
            if (i === eventCount) {
              workbook.xlsx.writeFile(path.join(__dirname, '/eventDetails.xlsx')).then(function () {
                console.log('file is written')
                res.download(path.join(__dirname, '/eventDetails.xlsx'), function (err, result) {
                  if (err) {
                    console.log('Error downloading file: ' + err)
                  } else {
                    console.log('File downloaded successfully')
                  }
                })
              })
            }
          })
        })
      })
    }
  } catch (err) {
    console.log('Error: ' + err)
  }
}
