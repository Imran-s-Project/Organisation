/* admin panel — Firebase (Auth + Firestore) ইনিশিয়ালাইজেশন
   একই Firebase প্রজেক্ট (member-selection) ব্যবহার করা হচ্ছে যেটা verify.html ও registration.js ব্যবহার করে */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-ke7FIUPX5Ksow8vJQ4axmGAIdiKd49Q",
  authDomain: "member-selection.firebaseapp.com",
  projectId: "member-selection",
  storageBucket: "member-selection.firebasestorage.app",
  messagingSenderId: "434008909239",
  appId: "1:434008909239:web:a790d1e0603ebfdbd27432",
  measurementId: "G-JVMKJZLCC5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
  onAuthStateChanged, signInWithEmailAndPassword, signOut
};
