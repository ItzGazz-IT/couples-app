import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6wfJWJ67ZVw6deIdVMPU4PXFwFC-0q54",
  authDomain: "finance-app-58a6d.firebaseapp.com",
  projectId: "finance-app-58a6d",
  storageBucket: "finance-app-58a6d.firebasestorage.app",
  messagingSenderId: "174685486229",
  appId: "1:174685486229:web:8f64e7db5673d526bf2f9c",
  measurementId: "G-R4TQWX45JM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };