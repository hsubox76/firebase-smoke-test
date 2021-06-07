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
import 'whatwg-fetch';

beforeAll(() => {
  console.log("FIREBASE VERSION", firebase.SDK_VERSION);
  firebase.initializeApp(config);
  firebase.setLogLevel("warn");
});

afterAll(() => {
  firebase.auth().signOut();
});

test('AUTH', async () => {
  const cred = await firebase
    .auth()
    .signInWithEmailAndPassword(testAccount.email, testAccount.password);
  console.log("Logged in with test account", cred.user.email);
  expect(cred.user.email).toBe(testAccount.email);
});

test('FUNCTIONS', async () => {
  const functions = firebase.functions();
  const callTest = functions.httpsCallable("callTest");
  const result = await callTest({ data: "blah" });
  expect(result.data.word).toBe('hellooo');
});

test('STORAGE', async () => {
  const storage = firebase.storage();
  const storageRef = storage.ref("/test.txt");
  await storageRef.putString("efg");
  await new Promise(resolve => setTimeout(resolve, 1000));
  const url = await storageRef.getDownloadURL();
  expect(url).toMatch('test.txt');
  const response = await fetch(url);
  const data = await response.text();
  expect(data).toBe('efg');
})