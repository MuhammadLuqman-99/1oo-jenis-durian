import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyDrznV1Id-KCk5Nj802ks8yMwMATryBc",
  authDomain: "jenisdurian.firebaseapp.com",
  projectId: "jenisdurian",
  storageBucket: "jenisdurian.firebasestorage.app",
  messagingSenderId: "167797260145",
  appId: "1:167797260145:web:4363b873a398d4a34700d0",
  measurementId: "G-DFRHNLZWG3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
