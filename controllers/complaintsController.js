const admin = require('firebase-admin');
var serviceAccount = require("./../config.json");

var Excel = require('exceljs');
const moment = require('moment');

var config = require('../config/config.js');

exports.generate_sheet = function(req, res) {
	try {
		function snapshotToArray(snapshot) {
	    var returnArr = [];
	    snapshot.forEach(function(childSnapshot) {
	    	var item = childSnapshot.key;
	    	returnArr.push(item);
	    });
	    return returnArr;
	 	};
		
		var months = ['January','Feburary','March','April', 'May','June','July','August', 'September','October','November','December'];
    var type = req.query.mode;
		var dated;
		var subject;
		var status;
		var workbook = new Excel.Workbook();
		var complaintRef = admin.database().ref();
		if(type == 'CUSTOM') {
			var d1 = req.query.from;
			var d2 = req.query.to;
			var worksheet = workbook.addWorksheet('Complaints');
			worksheet.columns = [
				{header: 'Subject', key: 'subject', width: 40},
				{header: 'Date of complaint', key: 'dated', width: 30},
				{header: 'Status', key: 'status', width: 20}
			];
			var complaintID;
			complaintRef.child('complaints/').once("value", function(snapshot) {
				complaintID = snapshotToArray(snapshot);
				complaintCount = complaintID.length;
				var i = 0;
				complaintID.forEach(function(element) {
					complaintRef.child('complaints/' + element).once("value", function(snapshot) {
						dated = snapshot.child('dated').val();
						var t1 = moment(dated, 'DD-MM-YYYY');
						var t2 = moment(d1, 'DD-MM-YYYY');
						var t3 = moment(d2, 'DD-MM-YYYY');
						if(moment(t2).isSameOrBefore(t1) && moment(t3).isSameOrAfter(t1)) {
							subject = snapshot.child('subject').val();
							status = snapshot.child('isResolved').val();
							dated = t1.format('dddd, Do MMM YYYY');	
							status = (status==true)?'Resolved':'Pending';
							worksheet.addRow({subject: subject, dated: dated, status: status});
						}
						i+=1;
							if(i==complaintCount) {
								workbook.xlsx.writeFile(__dirname + '/Complaints.xlsx').then(function() {
	              	console.log('file is written');
	              	res.download(__dirname + '/Complaints.xlsx', function(err, result){
	                  if(err){
	                  	console.log('Error downloading file: ' + err);  
	                  }
	                  else{
	                    	console.log('File downloaded successfully');
	                  }
	              	});
	            	});
							}
						});
					});
				});
			}
			
			else if(type == 'ALL') {
				console.log('extract monthly');
				var complaintID;
				complaintRef.child('complaints/').once("value", function(snapshot) {
					complaintID = snapshotToArray(snapshot);
					complaintCount = complaintID.length;
					var i = 0;
					complaintID.forEach(function(element) {
						complaintRef.child('complaints/' + element).once("value", function(snapshot) {
							dated = snapshot.child('dated').val();
							var t1 = moment(dated, 'DD-MM-YYYY');
							var mon = t1.month();
							if(workbook.getWorksheet(months[mon])) {
			                	worksheet = workbook.getWorksheet(months[mon]);
			                }
			                else {
			                 	var worksheet = workbook.addWorksheet(months[mon]);
			                	worksheet.columns = [
									{ header: 'Subject', key: 'subject', width: 40},
									{ header: 'Date of complaint', key: 'dated', width: 30},
									{ header: 'Status', key: 'status', width: 20}
								];
			                }
			                subject = snapshot.child('subject').val();
							status = snapshot.child('isResolved').val();
							dated = t1.format('dddd, Do MMM YYYY');	
							status = (status==true)?'Resolved':'Pending';
							worksheet.addRow({subject: subject, dated: dated, status: status});
							i+=1;
							if(i==complaintCount) {
								workbook.xlsx.writeFile(__dirname + '/Complaints.xlsx').then(function() {
	              	console.log('file is written');
                  	res.download(__dirname + '/Complaints.xlsx', function(err, result){
	                    if(err){
	                    	console.log('Error downloading file: ' + err);  
	                    }
		                else{
			              	console.log('File downloaded successfully');
		                }
	              	});
                });
							}
						});
					});
				});
			}
	} catch(err) {
        console.log('Error: ' + err);
    }
}