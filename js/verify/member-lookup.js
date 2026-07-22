/* verify.html — Firestore থেকে মেম্বার আইডি লুকআপ (মূল ভেরিফিকেশন লজিক) */
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { db } from './firebase-init.js';
import { state } from './state.js';
import { showView } from './views.js';
import { getMemberId } from './member-id.js';
import { showSuccess } from './success-view.js';
import { showError } from './error-view.js';

export async function verifyMember() {
    const memberId = getMemberId();

    if (!memberId || memberId === 'VERIFY') {
        showView('search-card');
        return;
    }

    showView('loader');

    const cachedData = sessionStorage.getItem(`rjf_member_${memberId}`);
    if (cachedData) {
        setTimeout(() => showSuccess(JSON.parse(cachedData)), 500);
        return;
    }

    try {
        const q = query(collection(db, "members"), where("member_id", "==", memberId));
        const querySnapshot = await getDocs(q);

        setTimeout(() => {
            if (querySnapshot.empty) {
                showError(state.lang === 'bn' ? `সদস্য আইডি <strong>${memberId}</strong> ডাটাবেসে পাওয়া যায়নি।` : `Member ID <strong>${memberId}</strong> not found in database.`);
            } else {
                const memberData = querySnapshot.docs[0].data();
                sessionStorage.setItem(`rjf_member_${memberId}`, JSON.stringify(memberData));
                showSuccess(memberData);
            }
        }, 800);

    } catch (error) {
        console.error("Verification Error:", error);
        showError(state.lang === 'bn' ? "সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। দয়া করে ইন্টারনেট কানেকশন চেক করুন।" : "Connection error. Please check your internet connection.");
    }
}
