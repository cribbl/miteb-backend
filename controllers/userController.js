const admin = require('firebase-admin');

function generateUID(abbrv) {
  var uid;
  uid = abbrv.replace(/\s/g,'').toLowerCase().slice(0, 4);
  uid = uid.concat(Math.random()*100000000);
  uid = uid.substring(0, 7);
  return uid;
}

exports.signup = function(req, res) {
  var newUser = req.body;
  admin.auth().createUser({
    uid: generateUID(newUser.abbrv),
    email: newUser.email,
    password: newUser.password,
  })
  .then(function(user) {
    newUser['uid'] = user.uid;
    newUser['isApproved'] = false;
    newUser['isClub'] = true,
    newUser['isFA'] = false,
    newUser['notificationSettings'] = {
      email: 1,
      sms: 0
    }
    newUser['fa'] = {
      name: "DEFAULT"
    }
    admin.database().ref('clubs/').child(user.uid).set(newUser);
    res.status(200).send({state: 'success', res: newUser});
  })
  .catch(function(err) {
    console.log(err.errorInfo);
    res.status(200).send({state: 'fail', err: err.errorInfo});
  })
};

exports.update_user = function(req, res) {
  // var uid = String(req.query.uid);
  uid = "z8sTDxIHeVZhorxqcFxe4j6fvRp2";
  // var newinfo = req.query.newinfo;
  // console.log(newinfo);
  
  var newinfox = {
    email: "dummymitfa@gmail.com",
    emailVerified: true,
    password: "Password@1234"
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