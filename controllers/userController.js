const admin = require('firebase-admin');
const config = require('../config/conf');

exports.update_user = function(req,res){
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

exports.index = function(req, res, next) {
	res.status(200).send("Hello World!");
};