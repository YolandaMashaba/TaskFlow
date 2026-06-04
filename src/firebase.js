// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDd5Z9gA40SqDssiFCFAipcy-rsSrWuSQQ",
  authDomain: "taskflow-e7a91.firebaseapp.com",
  projectId: "taskflow-e7a91",
  storageBucket: "taskflow-e7a91.firebasestorage.app",
  messagingSenderId: "190080312133",
  appId: "1:190080312133:web:bd79436827917b18c4d42c",
  measurementId: "G-3H6V0QJS9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;