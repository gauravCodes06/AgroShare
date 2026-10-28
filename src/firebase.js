import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ5qcn5mKlFEWBYqzIb_WoVQyBR5FS9vA",
  authDomain: "jspm-28094.firebaseapp.com",
  projectId: "jspm-28094",
  storageBucket: "jspm-28094.firebasestorage.app",
  messagingSenderId: "486294110180",
  appId: "1:486294110180:web:f7a87282795096a3b8d1f1",
  measurementId: "G-DTCXFM26M3",
  databaseURL: "https://jspm-28094-default-rtdb.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
