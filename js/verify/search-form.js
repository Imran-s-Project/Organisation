/* verify.html — সার্চ ফর্ম সাবমিট লজিক, অটো 'RJF-2026-' প্রিফিক্স যোগ করাসহ */
import { state } from './state.js';
import { showToast } from './toast.js';

export const initSearchForm = () => {
    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        let val = document.getElementById('search-input').value.trim().toUpperCase();

        if (val) {
            // ইউজার শুধু নম্বর লিখলে বা "RJF2026-9689" লিখলে অটো "RJF-2026-" বসানো
            if (/^\d/.test(val)) {
                val = 'RJF-2026-' + val;
            } else if (val.startsWith('RJF') && !val.startsWith('RJF-2026-')) {
                val = val.replace('RJF', 'RJF-2026-');
            }

            const regex = /^[a-zA-Z0-9\-]+$/;
            if (!regex.test(val)) {
                showToast(state.lang === 'bn' ? 'আইডিতে কোনো স্পেশাল ক্যারেক্টার/লিংক ব্যবহার করা যাবে না!' : 'No special characters/link allowed!', 'fa-circle-xmark', 'text-red-500');
                return;
            }
            window.location.href = window.location.pathname + '?id=' + encodeURIComponent(val);
        }
    });
};
