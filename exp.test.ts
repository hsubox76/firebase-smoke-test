import {
  initializeApp,
  setLogLevel,
  SDK_VERSION,
  FirebaseApp,
  deleteApp,
} from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getAnalytics,
  logEvent,
  isSupported as analyticsIsSupported,
} from "firebase/analytics";
import { getDatabase, ref as dbRef, onValue, off, update, remove, set } from "firebase/database";
import {
  collection,
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  where,
  query,
  deleteDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getPerformance, trace as perfTrace } from "firebase/performance";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { config, testAccount } from "./firebase-config";
import "whatwg-fetch";
import "chai/register-expect";
import { expect } from "chai";

describe("EXP", () => {
  let app: FirebaseApp;
  before(() => {
    console.log("FIREBASE VERSION", SDK_VERSION);
    app = initializeApp(config);
    setLogLevel("warn");
  });

  after(() => {
    signOut(getAuth(app));
    deleteApp(app);
  });

  it("AUTH", async () => {
    const auth = getAuth(app);
    const cred = await signInWithEmailAndPassword(
      auth,
      testAccount.email,
      testAccount.password
    );
    console.log("Logged in with test account", cred.user.email);
    expect(cred.user.email).to.equal(testAccount.email);
  });

  it("FUNCTIONS", async () => {
    const functions = getFunctions(app);
    const callTest = httpsCallable<{ data: string }, { word: string }>(
      functions,
      "callTest"
    );
    const result = await callTest({ data: "blah" });
    expect(result.data.word).to.equal("hellooo");
  });

  it("STORAGE", async () => {
    const storage = getStorage(app);
    const sRef = storageRef(storage, "/test.txt");
    await uploadString(sRef, "efg");
    const url = await getDownloadURL(sRef);
    expect(url).to.match(/test\.txt/);
    const response = await fetch(url);
    const data = await response.text();
    expect(data).to.equal("efg");
  });

  it("FIRESTORE", async () => {
    const firestore = getFirestore(app);
    await setDoc(doc(firestore, "testCollection/trueDoc"), {
      testbool: true,
    });
    // Reference doc a different way.
    await setDoc(doc(collection(firestore, "testCollection"), "falseDoc"), {
      testbool: false,
    });
    const trueDocs = await getDocs(
      query(
        collection(firestore, "testCollection"),
        where("testbool", "==", true)
      )
    );
    expect(trueDocs.docs.length).to.equal(1);
    await deleteDoc(doc(collection(firestore, "testCollection"), "trueDoc"));
    await deleteDoc(doc(firestore, "testCollection/falseDoc"));
    const testDocRef = doc(firestore, "testCollection/testDoc");
    let expectedData: any = {};
    onSnapshot(testDocRef, (snap) => {
      if (snap.exists()) {
        expect(snap.data()).to.deep.equal(expectedData);
      } else {
        expect(expectedData).to.be.null;
      }
    });
    expectedData = { word: "hi", number: 14 };
    await setDoc(testDocRef, { word: "hi", number: 14 });
    expectedData = { word: "bye", number: 14, newProp: ["a"] };
    await updateDoc(testDocRef, { word: "bye", newProp: ["a"] });
    expectedData = null;
    await deleteDoc(testDocRef);
  });

  it("DATABASE", async () => {
    const db = getDatabase(app);
    const ref = dbRef(db, "abc/def");
    let expectedValue: any = {};
    onValue(ref, (snap) => {
      if (snap.exists()) {
        expect(snap.val()).to.deep.equal(expectedValue);
      } else {
        expect(expectedValue).to.be.null;
      }
    });
    expectedValue = { text: "string 123 xyz" };
    await set(ref, { text: "string 123 xyz" });
    expectedValue.number = 987;
    await update(ref, { number: 987 });
    expectedValue = null;
    await remove(ref);
    off(ref);
  });

  it("MESSAGING", () => {
    getMessaging(app);
  });

  it("ANALYTICS", async () => {
    await analyticsIsSupported();
    logEvent(getAnalytics(app), "begin_checkout");
  });

  it("PERFORMANCE", () => {
    const performance = getPerformance(app);
    const trace = perfTrace(performance, "test");
    trace.start();
    trace.stop();
    trace.putAttribute("testattr", "perftestvalue");
    expect(trace.getAttribute("testattr")).to.equal("perftestvalue");
  });
});
