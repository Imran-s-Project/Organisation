/* সার্ভিস ওয়ার্কার রেজিস্ট্রেশন + কাস্টম "অ্যাপ ইনস্টল করুন" বাটন */
window.RJF = window.RJF || {};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('SW রেজিস্ট্রেশন ব্যর্থ:', err);
    });
  });
}

RJF.renderInstallButton = function () {
  var deferredPrompt = null;
  var btn = null;

  function createButton() {
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.type = 'button';
    btn.innerHTML = '<i class="fa-solid fa-download"></i> অ্যাপ ইনস্টল করুন';
    btn.style.cssText =
      'position:fixed; right:18px; bottom:18px; z-index:600;' +
      'display:none; align-items:center; gap:8px;' +
      'background:var(--turmeric,#E3A73E); color:#1A2420; border:none;' +
      'font-weight:700; font-size:.9rem; padding:12px 18px; border-radius:30px;' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.25); cursor:pointer;';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      btn.style.display = 'none';
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; });
    });
    return btn;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    createButton();
    btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', function () {
    if (btn) btn.style.display = 'none';
    deferredPrompt = null;
  });
};

document.addEventListener('DOMContentLoaded', function () {
  RJF.renderInstallButton();
});
