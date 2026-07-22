/* verify.html — ভেরিফাইড কার্ডে বর্তমান সময় বসানো */

export const updateLiveTime = () => {
    const now = new Date();
    document.getElementById('live-time').innerText = now.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
