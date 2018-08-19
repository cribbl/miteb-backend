const admin = require('firebase-admin');

function generateUID(abbrv) {
  var uid;
  uid = abbrv.replace(/\s/g,'').toLowerCase().slice(0, 4);
  uid = uid.concat(Math.random()*100000000);
  uid = uid.substring(0, 7);
  return uid;
}

exports.signup_club = function(req, res) {
  var newUser = req.body;
  admin.auth().createUser({
    uid: generateUID(newUser.abbrv),
    email: newUser.email,
    password: newUser.password,
  })
  .then(function(user) {
    newUser['password'] = null,
    newUser['uid'] = user.uid;
    newUser['isApproved'] = false;
    newUser['isClub'] = true,
    newUser['isFA'] = false,
    newUser['notificationSettings'] = {
      email: 1,
      sms: 0
    }
    newUser['fa'] = {
      name: "NOT CONNECTED YET"
    }
    admin.database().ref('users/').child(user.uid).set(newUser);
    res.status(200).send({state: 'success', newUser: newUser});
  })
  .catch(function(err) {
    console.log(err.errorInfo);
    res.status(200).send({state: 'fail', err: err.errorInfo});
  })
};

exports.signup_fa = function(req, res) {
  var newUser = req.body;
  var clubs = admin.database().ref('users/' + newUser.clubID);
  var club;
  clubs.once("value", function(snapshot) {
    club = snapshot.val();

    if(club == null) {
      var err = {
        code: 'auth/club-id-not-found',
        message: "Club ID was not found!"
      }
      res.status(200).send({state: 'fail', err: err});
      return;
    }

    else {
      admin.auth().createUser({
        uid: newUser.clubID + "FA",
        email: newUser.email,
        password: newUser.password,
      })
      .then(function(user) {
        newUser['password'] = null;
        newUser['nameAbbrv'] = "FA";
        newUser['uid'] = user.uid;
        newUser['clubID'] = newUser.clubID;
        newUser['isApproved'] = true;
        newUser['isFA'] = true;
        newUser['notificationSettings'] = {
          email: 1,
          sms: 0
        }
        console.log(newUser);
        admin.database().ref('users/').child(user.uid).set(newUser);
        admin.database().ref('users/').child(newUser.clubID + '/fa/name').set(newUser.name);
        admin.database().ref('users/').child(newUser.clubID + '/fa_uid').set(newUser.uid);
        res.status(200).send({state: 'success', newUser: newUser});
      })
      .catch(function(err) {
        console.log(err.errorInfo);
        res.status(200).send({state: 'fail', err: err.errorInfo});
      })
    }
  });
};

exports.update_user = function(req, res) {
  // var uid = String(req.query.uid);
  uid = "z8sTDxIHeVZhorxqcFxe4j6fvRp2";
  // var newinfo = req.query.newinfo;
  // console.log(newinfo);
  
  var newinfox = {
    email: "dummymitfa@gmail.com",
    emailVerified: true,
    password: "***REMOVED***"
  }

  admin.auth().updateUser(uid, newinfox)
    .then(function(userRecord) {
      console.log("Successfully updated user", userRecord.toJSON());
      res.status(200).send("Successfully updated user", userRecord.toJSON())
    })
    .catch(function(error) {
      console.log("Error updating user:", error);
      res.status(302).send("Error updating user:", error);
    });
};