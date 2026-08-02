import { auth, onAuthStateChanged, signInWithEmailAndPassword } from './firebase.js';
import { ADMIN_EMAILS } from './admin-config.js';

const form = document.getElementById('loginForm');
const errBox = document.getElementById('loginError');
const btn = document.getElementById('loginBtn');

function showError(msg) {
  errBox.textContent = msg;
  errBox.classList.add('show');
}

// ইতিমধ্যে লগইন করা থাকলে সরাসরি ড্যাশবোর্ডে পাঠিয়ে দাও
onAuthStateChanged(auth, function (user) {
  if (user && ADMIN_EMAILS.includes(user.email)) {
    window.location.href = 'index.html';
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  errBox.classList.remove('show');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> লগইন হচ্ছে...';

  signInWithEmailAndPassword(auth, email, password)
    .then(function (cred) {
      if (!ADMIN_EMAILS.includes(cred.user.email)) {
        showError('এই একাউন্টের এডমিন প্যানেলে প্রবেশাধিকার নেই।');
        auth.signOut();
        return;
      }
      window.location.href = 'index.html';
    })
    .catch(function (err) {
      console.error(err);
      var msg = 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড ভুল আছে।';
      if (err.code === 'auth/too-many-requests') msg = 'অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      if (err.code === 'auth/network-request-failed') msg = 'ইন্টারনেট কানেকশন চেক করুন।';
      showError(msg);
    })
    .finally(function () {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> লগইন করুন';
    });
});
