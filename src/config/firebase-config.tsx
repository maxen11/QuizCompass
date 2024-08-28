// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjTfPt62w33ToNBVhfl09luZSObs9qKe4",
  authDomain: "tddd27-quizcompass-40e92.firebaseapp.com",
  databaseURL: "https://tddd27-quizcompass-40e92-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tddd27-quizcompass-40e92",
  storageBucket: "tddd27-quizcompass-40e92.appspot.com",
  messagingSenderId: "1095508749321",
  appId: "1:1095508749321:web:3dc49808ec2edd03ea1cd8",
  measurementId: "G-NKQF3SEQX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const realTimeDb = getDatabase(app);

export const db = getFirestore(app);
// connectFirestoreEmulator(db, "localhost", 8080);

export const auth = getAuth(app);

export const storage = getStorage(app);