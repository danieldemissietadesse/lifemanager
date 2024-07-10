// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDR1WSRZY7pmOcPRR_RYwV5O5kSwLTSow8",
  authDomain: "lifemanager-e9a32.firebaseapp.com",
  projectId: "lifemanager-e9a32",
  storageBucket: "lifemanager-e9a32.appspot.com",
  messagingSenderId: "713689999202",
  appId: "1:713689999202:web:83ab8f48464d01d5ff6e3b",
  measurementId: "G-VQ06GJB1QN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);