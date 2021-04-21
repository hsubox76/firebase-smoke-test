import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/functions";
import "firebase/storage";
import "firebase/firestore";
import "firebase/messaging";
import "firebase/performance";
import "firebase/installations";
import "firebase/database";
import { config, testAccount } from "./firebase-config";

/**
 * Smoke tests. These are very minimal and mostly just ensure that
 * each product is registered and initialized without errors.
 */

/**
 * Auth smoke test.
 * 
 * Login with email and password. Account must exist. Should set up
 * test project rules to only allow read/writes from this account
 * (and other test accounts), to properly test rules.
 * 
 * Logout after all tests are done.
 */
async function authLogin() {
  const cred = await firebase
    .auth()
    .signInWithEmailAndPassword(testAccount.email, testAccount.password);
  console.log("[AUTH] Logged in with test account", cred.user.email);
  return cred;
}
async function authLogout() {
  console.log("[AUTH] Logging out user");
  return firebase.auth.signOut();
}

/**
 * Functions smoke test.
 * 
 * Call a deployed function.
 * This cloud function must be deployed in this project first. It can be
 * found in this repo's /functions folder.
 */
async function callFunctions() {
  console.log("[FUNCTIONS] start");
  const functions = firebase.functions();
  const callTest = functions.httpsCallable("callTest");
  const result = await callTest({ data: "blah" });
  console.log("[FUNCTIONS] result:", result.data);
}

/**
 * Storage smoke test.
 * Create, read, delete.
 */
async function callStorage() {
  console.log("[STORAGE] start");
  const storage = firebase.storage();
  const storageRef = storage.ref("/test.txt");
  await storageRef.putString("efg");
  const url = await storageRef.getDownloadURL();
  console.log("[STORAGE] download url", url);
  const response = await fetch(url);
  const data = await response.text();
  console.log("[STORAGE] Returned data (should be 'efg'):", data);
  await storageRef.delete();
}

/**
 * Firestore smoke test.
 * Create 2 docs, test query filter.
 * Create, update, delete a doc with `onSnapshot` monitoring changes.
 */
async function callFirestore() {
  console.log("[FIRESTORE] start");
  const firestore = firebase.firestore();
  await firestore.collection("testCollection").doc("trueDoc").set({
    testbool: true,
  });
  await firestore.collection("testCollection").doc("falseDoc").set({
    testbool: false,
  });
  const trueDocs = await firestore
    .collection("testCollection")
    .where("testbool", "==", true)
    .get();
  trueDocs.docs.forEach((doc) =>
    console.log("[FIRESTORE] Filter test, expect one doc", doc.data())
  );
  await firestore.collection("testCollection").doc("trueDoc").delete();
  await firestore.collection("testCollection").doc("falseDoc").delete();
  const testDocRef = firestore.doc("testCollection/testDoc");
  console.log("[FIRESTORE] Doc creation and updating");
  testDocRef.onSnapshot((snap) => {
    if (snap.exists) {
      console.log("[FIRESTORE] SNAPSHOT:", snap.data());
    } else {
      console.log("[FIRESTORE] Snapshot doesn't exist");
    }
  });
  console.log("[FIRESTORE] creating (expect to see snapshot data)");
  await testDocRef.set({ word: "hi", number: 14 });
  console.log("[FIRESTORE] updating (expect to see snapshot data change)");
  await testDocRef.update({ word: "bye", newProp: ["a"] });
  console.log("[FIRESTORE] deleting (expect to see snapshot doesn't exist)");
  await testDocRef.delete();
}

/**
 * Database smoke test.
 * Create, update, delete a doc with `on` monitoring changes.
 */
async function callDatabase() {
  console.log("[DATABASE] start");
  const db = firebase.database();
  const ref = db.ref("abc/def");
  ref.on("value", (snap) => {
    if (snap.exists()) {
      console.log(`[DATABASE] value: ${JSON.stringify(snap.val())}`);
    } else {
      console.log("[DATABASE] Snapshot doesn't exist");
    }
  });
  console.log("[DATABASE] creating (expect to see snapshot data)");
  await ref.set({ text: "string 123 xyz" });
  console.log("[DATABASE] updating (expect to see snapshot data change)");
  await ref.update({ number: 987 });
  console.log("[DATABASE] deleting (expect to see snapshot doesn't exist)");
  await ref.remove();
  ref.off();
}

/**
 * Messaging smoke test.
 * Call getToken(), it won't work on localhost, just a minimal test to make
 * sure library has registered and initialized.
 */
async function callMessaging() {
  console.log("[MESSAGING] start");
  const messaging = firebase.messaging();

  return messaging
    .getToken()
    .then((token) => console.log(`[MESSAGING] Got token: ${token}`))
    .catch((e) => {
      if (e.message.includes("messaging/permission-blocked")) {
        console.log("[MESSAGING] Permission blocked (expected on localhost)");
      } else {
        throw e;
      }
    });
}

/**
 * Analytics smoke test.
 * Just make sure some functions can be called without obvious errors.
 */
function callAnalytics() {
  console.log("[ANALYTICS] start");
  firebase.analytics.isSupported();
  firebase.analytics().logEvent("begin_checkout");
  console.log("[ANALYTICS] logged event");
}

/**
 * Analytics smoke test.
 * Just make sure a function can be called without obvious errors.
 */
function callInstallations() {
  console.log("[INSTALLATIONS] start");
  firebase.installations();
  console.log("[INSTALLATIONS] token refresh");
  firebase.installations().getToken(true);
}

/**
 * Analytics smoke test.
 * Just make sure some functions can be called without obvious errors.
 */
function callPerformance() {
  console.log("[PERFORMANCE] start");
  const performance = firebase.performance();
  const trace = performance.trace("test");
  trace.start();
  trace.stop();
  trace.putAttribute("testattr", "perftestvalue");
  console.log(
    "[PERFORMANCE] trace (should be 'perftestvalue')",
    trace.getAttribute("testattr")
  );
}

/**
 * Run all smoke tests.
 */
async function main() {
  console.log("FIREBASE VERSION", firebase.SDK_VERSION);
  const app = firebase.initializeApp(config);
  firebase.setLogLevel("warn");

  await authLogin();
  await callStorage();
  await callFirestore();
  await callDatabase();
  await callMessaging();
  callAnalytics();
  callInstallations();
  callPerformance();
  await callFunctions();
  await authLogout();
  console.log("DONE");
}

main();
