// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5wJb_scIwa86oDJDWXUz8uka5dpQMqoU",
  authDomain: "gymledger-app.firebaseapp.com",
  projectId: "gymledger-app",
  storageBucket: "gymledger-app.firebasestorage.app",
  messagingSenderId: "245057824875",
  appId: "1:245057824875:web:833749c50dc1a6233de92e",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
