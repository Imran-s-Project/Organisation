/* verify.html — ভেরিফিকেশন সফল হলে verified-card সাজানো (QR কোড, তথ্য, বাটন ওয়্যারিং) */
import { state } from './state.js';
import { showView } from './views.js';
import { getMemberId } from './member-id.js';
import { renderDynamicInfo } from './render-member-info.js';
import { updateLiveTime } from './live-time.js';
import { wireCardActions } from './card-actions.js';
import { triggerConfetti } from './confetti-effect.js';

export function showSuccess(data) {
    showView('verified-card');

    document.title = `Verified: ${data.full_name || 'Member'} | RJF`;
    document.getElementById('display-id').innerText = data.member_id || getMemberId();

    const profileImg = document.getElementById('profile-img');
    if (data.photo_url) profileImg.src = data.photo_url;

    const currentUrl = window.location.origin + window.location.pathname + '?id=' + (data.member_id || getMemberId());
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: currentUrl, width: 60, height: 60,
        colorDark: "#0f172a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.L
    });

    renderDynamicInfo(data, state.lang);
    updateLiveTime();

    wireCardActions(data, currentUrl);

    triggerConfetti();
}
