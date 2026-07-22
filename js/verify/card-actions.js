/* verify.html — ভেরিফাইড কার্ডের কপি/শেয়ার/ইমেজ-সেভ/পিডিএফ বাটনগুলোর কাজ */
import { state } from './state.js';
import { showToast } from './toast.js';
import { getMemberId } from './member-id.js';

export const wireCardActions = (data, currentUrl) => {
    document.getElementById('copy-id-btn').onclick = () => {
        navigator.clipboard.writeText(data.member_id || getMemberId()).then(() => {
            showToast(state.lang === 'bn' ? 'আইডি কপি করা হয়েছে!' : 'ID Copied!', 'fa-copy');
        });
    };

    document.getElementById('share-btn').onclick = () => {
        if (navigator.share) {
            navigator.share({ title: 'Verified Member - RJF', text: `${data.full_name}-এর ভেরিফাইড মেম্বারশিপ প্রোফাইল দেখুন।`, url: currentUrl }).catch(console.error);
        } else {
            navigator.clipboard.writeText(currentUrl).then(() => showToast(state.lang === 'bn' ? 'লিংকটি কপি করা হয়েছে!' : 'Link Copied!'));
        }
    };

    document.getElementById('download-btn').onclick = () => {
        const card = document.getElementById('verified-card');
        const isDark = document.documentElement.classList.contains('dark');
        const watermark = document.getElementById('card-watermark');

        showToast(state.lang === 'bn' ? 'কার্ড ডাউনলোড হচ্ছে...' : 'Downloading Card...', 'fa-spinner fa-spin', 'text-blue-400');

        watermark.classList.remove('opacity-0');
        watermark.classList.add('opacity-10');

        html2canvas(card, {
            ignoreElements: (element) => element.classList.contains('no-print'),
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            scale: 2, useCORS: true
        }).then(canvas => {
            watermark.classList.remove('opacity-10');
            watermark.classList.add('opacity-0');
            const link = document.createElement('a');
            link.download = `RJF_Verified_${data.member_id || getMemberId()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Download Error:", err);
            watermark.classList.remove('opacity-10'); watermark.classList.add('opacity-0');
            showToast(state.lang === 'bn' ? 'ডাউনলোড করতে সমস্যা হচ্ছে!' : 'Download failed!', 'fa-triangle-exclamation', 'text-red-400');
        });
    };

    document.getElementById('pdf-btn').onclick = () => {
        const card = document.getElementById('verified-card');
        const isDark = document.documentElement.classList.contains('dark');
        const watermark = document.getElementById('card-watermark');

        showToast(state.lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...', 'fa-file-pdf', 'text-red-400');

        watermark.classList.remove('opacity-0');
        watermark.classList.add('opacity-10');

        html2canvas(card, {
            ignoreElements: (element) => element.classList.contains('no-print'),
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            scale: 2, useCORS: true
        }).then(canvas => {
            watermark.classList.remove('opacity-10'); watermark.classList.add('opacity-0');

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`RJF_ID_${data.member_id || getMemberId()}.pdf`);
        });
    };
};
