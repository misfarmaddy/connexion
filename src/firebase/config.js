// CONNEXION - Firebase & Dual-Mode Configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { mockSync } from "./mockSyncService";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.databaseURL
);

let app = null;
let db = null;
let rtdb = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    auth = getAuth(app);
    console.log("⚡ CONNEXION: Connected to live Firebase backend!");
  } catch (error) {
    console.warn("⚠️ Firebase init failed, falling back to Local Sync Mode:", error);
  }
} else {
  // Initialize in-memory / cross-tab broadcast storage
  mockSync.initializeStorage();
  console.log("⚡ CONNEXION: Running in Instant Cross-Tab Live Sync Mode (zero configuration required).");
}

export { app, db, rtdb, auth };