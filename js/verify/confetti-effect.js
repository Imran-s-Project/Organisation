/* verify.html — সফল ভেরিফিকেশনের পর কনফেটি ইফেক্ট (canvas-confetti লাইব্রেরি লাগে) */

export const triggerConfetti = () => {
    var duration = 3 * 1000;
    var end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#0d9488', '#059669', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#0d9488', '#059669', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
};
