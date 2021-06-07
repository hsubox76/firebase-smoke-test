import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { config } from "./firebase-config";

/**
 * Run all smoke tests.
 */
async function main() {
  console.log("FIREBASE VERSION", firebase.SDK_VERSION);
  const app = firebase.initializeApp(config);
  firebase.setLogLevel('info');
  const firestore = firebase.firestore();
  console.log('beginning firestore set()');
  try {await firestore.collection("testCollection").doc("trueDoc").set({
    testbool: true,
  });} catch(e) {
    console.error(e);
  }
  console.log('firestore set() complete');
}

main();
