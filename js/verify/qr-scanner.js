/* verify.html — QR কোড স্ক্যান করে আইডি বসিয়ে সার্চ করার ফিচার */
import { showToast } from './toast.js';
import { state } from './state.js';

export const initQrScanner = () => {
    const qrScanBtn = document.getElementById('qr-scan-btn');
    const qrModal = document.getElementById('qr-modal');
    const closeQrBtn = document.getElementById('close-qr-btn');
    let html5QrcodeScanner;

    const closeQrModal = () => {
        qrModal.classList.add('hidden');
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                html5QrcodeScanner = null;
                document.getElementById('qr-reader').innerHTML = '';
            }).catch(err => console.error("Failed to clear scanner", err));
        }
    };

    qrScanBtn.addEventListener('click', () => {
        qrModal.classList.remove('hidden');
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader", { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, false);

            html5QrcodeScanner.render((decodedText) => {
                let scannedId = decodedText;
                try {
                    const url = new URL(decodedText);
                    scannedId = url.searchParams.get('id') || decodedText;
                } catch (e) {}

                document.getElementById('search-input').value = scannedId;
                closeQrModal();
                showToast(state.lang === 'bn' ? 'স্ক্যান সফল হয়েছে!' : 'Scan Successful!', 'fa-check-circle', 'text-green-500');
                document.getElementById('search-form').dispatchEvent(new Event('submit'));
            }, (errorMessage) => {
                // ব্যাকগ্রাউন্ড স্ক্যান এরর উপেক্ষা করা হচ্ছে
            });
        }
    });

    closeQrBtn.addEventListener('click', closeQrModal);
};
