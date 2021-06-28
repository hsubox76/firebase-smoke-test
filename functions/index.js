const functions = require("firebase-functions");

exports.onNpmPublish = functions.https.onRequest((req, res) => {
  console.log(req.body);
  res.end();
});