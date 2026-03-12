import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we are on the client side and have an API key before initializing
const app = (typeof window !== "undefined" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

// Export with safety checks
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;
export default app;