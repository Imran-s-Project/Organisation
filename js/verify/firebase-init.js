/* verify.html — Firebase (Firestore) ইনিশিয়ালাইজেশন */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC-ke7FIUPX5Ksow8vJQ4axmGAIdiKd49Q",
    authDomain: "member-selection.firebaseapp.com",
    projectId: "member-selection",
    storageBucket: "member-selection.firebasestorage.app",
    messagingSenderId: "434008909239",
    appId: "1:434008909239:web:a790d1e0603ebfdbd27432",
    measurementId: "G-JVMKJZLCC5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
