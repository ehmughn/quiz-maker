import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqOIE5yuozDEYPRt6yfDmIcKOBcp8o1Dw",
  authDomain: "quiz-maker-1599f.firebaseapp.com",
  projectId: "quiz-maker-1599f",
  storageBucket: "quiz-maker-1599f.firebasestorage.app",
  messagingSenderId: "603793916656",
  appId: "1:603793916656:web:f4ac74bc275c4437323835",
  measurementId: "G-0ZX28PTBS3",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
