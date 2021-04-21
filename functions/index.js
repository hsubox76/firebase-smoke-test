const functions = require("firebase-functions");

exports.callTest = functions.https.onCall(() => {
    return({ word: "hellooo" });
});