import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/analytics";
import "firebase/compat/functions";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import "firebase/compat/messaging";
import "firebase/compat/performance";
import "firebase/compat/database";
import { config, testAccount } from "./firebase-config";
import "whatwg-fetch";
import { expect } from 'chai';
import { FirebaseApp } from "@firebase/app";

describe("COMPAT", () => {
  let app: FirebaseApp;
  before(() => {
    console.log("FIREBASE VERSION", firebase.SDK_VERSION);
    app = firebase.initializeApp(config);
    firebase.setLogLevel("warn");
  });

  after(async () => {
    await firebase.auth().signOut();
    // @ts-ignore
    await app.delete();
  });

  it("AUTH", async () => {
    const cred = await firebase
      .auth()
      .signInWithEmailAndPassword(testAccount.email, testAccount.password);
    console.log("Logged in with test account", cred.user.email);
    expect(cred.user.email).to.equal(testAccount.email);
  });

  it("FUNCTIONS", async () => {
    const functions = firebase.functions();
    const callTest = functions.httpsCallable("callTest");
    const result = await callTest({ data: "blah" });
    expect(result.data.word).to.equal("hellooo");
  });

  it("STORAGE", async () => {
    const storage = firebase.storage();
    const storageRef = storage.ref("/test.txt");
    await storageRef.putString("efg");
    const url = await storageRef.getDownloadURL();
    expect(url).to.match(/test\.txt/);
    const response = await fetch(url);
    const data = await response.text();
    expect(data).to.equal("efg");
  });

  it("FIRESTORE", async () => {
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
    expect(trueDocs.docs.length).to.equal(1);
    await firestore.collection("testCollection").doc("trueDoc").delete();
    await firestore.collection("testCollection").doc("falseDoc").delete();
    const testDocRef = firestore.doc("testCollection/testDoc");
    let expectedSnap: any = {};
    testDocRef.onSnapshot((snap) => {
      expect(snap.exists).to.equal(expectedSnap.exists);
      if (snap.exists) {
        expect(snap.data()).to.deep.equal(expectedSnap.data);
      }
    });
    expectedSnap = { exists: true, data: { word: "hi", number: 14 } };
    await testDocRef.set({ word: "hi", number: 14 });
    expectedSnap = {
      exists: true,
      data: { word: "bye", number: 14, newProp: ["a"] },
    };
    await testDocRef.update({ word: "bye", newProp: ["a"] });
    expectedSnap = { exists: false };
    await testDocRef.delete();
  });

  it("DATABASE", async () => {
    const db = firebase.database();
    const ref = db.ref("abc/def");
    let expectedValue: any = {};
    ref.on("value", (snap) => {
      if (snap.exists()) {
        expect(snap.val()).to.deep.equal(expectedValue);
      } else {
        expect(expectedValue).to.be.null;
      }
    });
    expectedValue = { text: "string 123 xyz" };
    await ref.set({ text: "string 123 xyz" });
    expectedValue.number = 987;
    await ref.update({ number: 987 });
    expectedValue = null;
    await ref.remove();
    ref.off();
  });

  it("MESSAGING", () => {
    firebase.messaging();
  });

  it("ANALYTICS", async () => {
    await firebase.analytics.isSupported();
    firebase.analytics().logEvent("begin_checkout");
  });

  it("PERFORMANCE", () => {
    const performance = firebase.performance();
    const trace = performance.trace("test");
    trace.start();
    trace.stop();
    trace.putAttribute("testattr", "perftestvalue");
    expect(trace.getAttribute('testattr')).to.equal('perftestvalue');
  });
});
