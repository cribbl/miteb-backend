const admin = require('firebase-admin')

// shall change the path based on env later
var serviceAccount = require('./config.json')

// shall change the dbURL based on env later
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-setup-cbd35.firebaseio.com'
})

const users = [
	{
		uid: 'associatedirector',
		email: 'dummymitad@gmail.com',
		password: 'Password@1234',
  		emailVerified: true,
  	},
  	{
		uid: 'dumm123',
		email: 'dummymitclub@gmail.com',
		password: 'Password@1234',
  		emailVerified: true,
  	},
  	{
		uid: 'dumm123FA',
		email: 'dummymitfa@gmail.com',
		password: 'Password@1234',
  		emailVerified: true,
  	},
  	{
		uid: 'securityofficer',
		email: 'dummymitso@gmail.com',
		password: 'Password@1234',
  		emailVerified: true,
  	},
  	{
		uid: 'studentcouncil',
		email: 'dummymitsc@gmail.com',
		password: 'Password@1234',
  		emailVerified: true,
  	}
]

let add_basic_users = () => {
    users.forEach(user => {
        admin.auth().createUser( user )
            .then((user) => {
                console.log(user.uid + ' created.')
            })
            .catch((err) => {
                console.log(err.errorInfo)
                console.log(user.uid + ' failed to create.')
            })
    })
}

add_basic_users()


const basic_db_data = {
  "developers" : {
    "arushi" : {
      "facebook" : "https://www.facebook.com/arushi.nigam1",
      "github" : "https://github.com/Arushi1912",
      "name" : "Arushi Nigam",
      "pos" : 0,
      "profilePicURL" : "https://cdn.dribbble.com/users/244753/screenshots/3959959/nespresso.gif",
      "role" : "Front End Developer"
    },
    "backendDeveloper" : {
      "description" : "We are looking for a developers interested in the Back End of an application to join our organization. You’ll be responsible for programming the code in computing languages to inform a website on how it is supposed to function.You will be working on Node.js, Firebase admin, AWS, Express JS, and best practices of client-server architecture.",
      "name" : "Back End Developer",
      "openPosition" : true,
      "pos" : 1,
      "profilePicURL" : "https://firebasestorage.googleapis.com/v0/b/mit-clubs-management.appspot.com/o/developers%2Fprogrammer.gif?alt=media&token=9a6c2168-f9fc-4e3e-8442-9db4fa9af269",
      "role" : "2 Open Positions"
    }
  },
  "disabledDates" : [ "27-08-2018", "28-08-2018" ],
  "events" : {
    "dummfoss344421" : {
      "AD_appr" : "NA",
      "FA_appr" : "pending",
      "FA_name" : "Fac Ad Pai",
      "SO_appr" : "NA",
      "booker_contact" : "7760627296",
      "booker_email" : "bhansalibhawesh@yahoo.com",
      "booker_name" : "Bhawesh Bhansali",
      "booker_reg_no" : "150911124",
      "clubEmail" : "dummymitclub@gmail.com",
      "clubID" : "dumm408",
      "clubName" : "Dummy MIT Club",
      "desc" : "A workshop on Open Source",
      "endDate" : "19-12-2018",
      "end_time" : "7:45pm",
      "rooms" : [ 5201, 5202 ],
      "startDate" : "18-12-2018",
      "start_time" : "5:45pm",
      "title" : "FOSS Workshop",
      "type" : "External"
    }
  },
  "roomsx" : {
    "18-12-2018" : [ 5201, 5202 ],
    "19-12-2018" : [ 5201, 5202 ]
  },
  "to-be-held" : {
    "18-12-2018" : {
      "-LTpJcdAjTpHofKXN3O2" : "dummfoss344421"
    },
    "19-12-2018" : {
      "-LTpJcdBUWHmO4aA5_jo" : "dummfoss344421"
    }
  },
  "users" : {
    "associatedirector" : {
      "abbrv" : "AD",
      "email" : "dummymitad@gmail.com",
      "emailVerification" : true,
      "isAD" : true,
      "isApproved" : true,
      "name" : "Narayana Shenoy",
      "nameAbbrv" : "AD",
      "notificationSettings" : {
        "email" : 1,
        "sms" : 1
      },
      "primaryContact" : "7760627296",
      "uid" : "associatedirector"
    },
    "dumm408" : {
      "abbrv" : "dummymitclub",
      "category" : "technical",
      "email" : "dummymitclub@gmail.com",
      "emailVerification" : true,
      "fa" : {
        "name" : "Fac Ad Pai"
      },
      "fa_uid" : "dumm408FA",
      "isApproved" : true,
      "isClub" : true,
      "isFA" : false,
      "my_events" : {
        "-LTpJcYBub90RM7THtKe" : "dummfoss344421"
      },
      "name" : "Dummy MIT Club",
      "notificationSettings" : {
        "email" : 1,
        "sms" : 0
      },
      "primaryContact" : "7760627296",
      "uid" : "dumm408"
    },
    "dumm408FA" : {
      "abbrv" : "FA",
      "category" : "technical",
      "clubID" : "dumm408",
      "email" : "dummymitfa@gmail.com",
      "emailVerification" : true,
      "isApproved" : true,
      "isFA" : true,
      "name" : "Fac Ad Pai",
      "nameAbbrv" : "FA",
      "notificationSettings" : {
        "email" : 1,
        "sms" : 0
      },
      "primaryContact" : "7760627296",
      "uid" : "dumm408FA"
    },
    "securityofficer" : {
      "abbrv" : "SO",
      "email" : "dummymitso@gmail.com",
      "emailVerification" : true,
      "isApproved" : true,
      "isSO" : true,
      "name" : "Ashok Rao",
      "nameAbbrv" : "SO",
      "notificationSettings" : {
        "email" : 1,
        "sms" : 1
      },
      "primaryContact" : "7760627296",
      "uid" : "securityofficer"
    },
    "studentcouncil" : {
      "abbrv" : "SCM",
      "category" : "council",
      "email" : "dummymitsc@gmail.com",
      "emailVerification" : true,
      "fa" : {
        "name" : "Narayana Shenoy"
      },
      "fa_uid" : "associatedirector",
      "isApproved" : true,
      "isClub" : true,
      "isSC" : true,
      "name" : "Student Council",
      "nameAbbrv" : "SC",
      "notificationSettings" : {
        "email" : 1,
        "sms" : 1
      },
      "primaryContact" : "7760627296",
      "profilePicURL" : "https://firebasestorage.googleapis.com/v0/b/staging-mit-event-booking.appspot.com/o/studentcouncil%2FprofilePic?alt=media&token=eae6e034-f8dd-489d-8ee9-f16401a36913",
      "uid" : "studentcouncil"
    }
  }
}

let add_basic_db =  async () => {
    await admin.database().ref().child('/users').set(basic_db_data)
        .then(() => console.log("Succeeded"))
        .catch(() => console.log("Failed"))
    process.exit();

}

 add_basic_db();
