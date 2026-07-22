/* verify.html — মাইক দিয়ে ভয়েস সার্চ ফিচার */
import { state } from './state.js';
import { showToast } from './toast.js';

export const initVoiceSearch = () => {
    const voiceBtn = document.getElementById('voice-search-btn');
    const searchInput = document.getElementById('search-input');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';

        recognition.onstart = function () {
            voiceBtn.classList.add('animate-pulse', 'text-red-500', 'bg-red-100');
            showToast(state.lang === 'bn' ? ' এখন বলুন, আমি শুনছি...' : 'Listening...', 'fa-microphone');
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript.replace(/\s+/g, '').toUpperCase();
            searchInput.value = transcript;
            voiceBtn.classList.remove('animate-pulse', 'text-red-500', 'bg-red-100');
            showToast(state.lang === 'bn' ? 'সার্চ করা হচ্ছে...' : 'Searching...', 'fa-search');
            document.getElementById('search-form').dispatchEvent(new Event('submit'));
        };

        recognition.onerror = function (event) {
            voiceBtn.classList.remove('animate-pulse', 'text-red-500', 'bg-red-100');
        };

        voiceBtn.addEventListener('click', () => { recognition.start(); });
    } else {
        voiceBtn.style.display = 'none';
    }
};
