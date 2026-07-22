/* verify.html — নিচে ছোট্ট টোস্ট নোটিফিকেশন দেখানোর হেল্পার */

export const showToast = (message, icon = 'fa-clipboard-check', color = 'text-teal-400') => {
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.className = "fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm shadow-2xl z-50 animate-pop-in flex items-center gap-2 font-semibold";
    toast.innerHTML = `<i class='fas ${icon} ${color} text-lg'></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};
