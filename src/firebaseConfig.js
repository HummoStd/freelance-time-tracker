// ✅ ARCHIVO: src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAE7SHoHj6DrKIaivvequfYgWN2gobobyM",
  authDomain: "freelancetimetracker-4e429.firebaseapp.com",
  projectId: "freelancetimetracker-4e429",
  storageBucket: "freelancetimetracker-4e429.appspot.com",
  messagingSenderId: "4078193063",
  appId: "1:4078193063:web:07ed7c5a8e00b4a6d70e82"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
