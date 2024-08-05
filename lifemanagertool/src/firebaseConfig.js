import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDR1WSRZY7pmOcPRR_RYwV5O5kSwLTSow8",
  authDomain: "lifemanager-e9a32.firebaseapp.com",
  projectId: "lifemanager-e9a32",
  storageBucket: "lifemanager-e9a32.appspot.com",
  messagingSenderId: "713689999202",
  appId: "1:713689999202:web:83ab8f48464d01d5ff6e3b",
  measurementId: "G-VQ06GJB1QN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Uncomment the following line if you're using Firebase emulators
// connectFunctionsEmulator(functions, "localhost", 5001);

export { auth, db, functions,app };