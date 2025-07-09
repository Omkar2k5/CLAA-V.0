// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtYttT9JbNeu2QyJkH6w-PyhLekypHJqs",
  authDomain: "college-application-7a4e7.firebaseapp.com",
  projectId: "college-application-7a4e7",
  storageBucket: "college-application-7a4e7.firebasestorage.app",
  messagingSenderId: "488558276736",
  appId: "1:488558276736:web:53fe2a96cd026046067665",
  measurementId: "G-RYDTDCKXVQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized");

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log("Firebase Auth initialized");

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log("Firestore initialized");

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
if (analytics) {
  console.log("Firebase Analytics initialized");
}

export default app;
