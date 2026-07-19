/* দান করুন পেজ — index.html-এ এই ফাইলের প্রভাব নেই, #/donate রুটে render হয়
   (আগের standalone donate/index.html + script.js এখন এই একটা মডিউলে) */
window.RJF = window.RJF || {};

/* সব লেখা ও কনফিগ এক জায়গায় — বদলাতে চাইলে এখানেই বদলাও */
RJF.donateData = {
  kicker: "সকলে মিলে দারিদ্র্যমুক্ত বাংলাদেশ গড়ি",
  title: "আপনার একটি দান, একটি মানুষের প্রাণ বাঁচাতে পারে",
  desc: "আপনার দান করার আগ্রহ দেখে আমরা আনন্দিত। নিচের নাম্বারে টাকা পাঠিয়ে ফর্মটি সঠিকভাবে পূরণ করুন — আপনার তথ্য যাচাই করে ইমেইলে জানানো হবে।",

  payLabel: "bKash / Nagad / Rocket (Personal)",
  payNumber: "01521748116",

  amounts: [100, 500, 1000],

  recaptchaSiteKey: "6Ldx_FAtAAAAAGVnWDz3cdQsupcEnylwb_yj4QTo",
  scriptUrl: "https://script.google.com/macros/s/AKfycbz-9za8KZDEr690CordlOIHRhD_LAfdocfY5zgwADX8pVmwALJFn3XjvJYMikbYLnWy/exec",

  trxHelpText: "আপনার পেমেন্ট সফল হওয়ার পর ফিরতি এসএমএস-এ ৮-১০ অক্ষরের একটি আইডি পাবেন। উদাহরণ: CLD43KKDRG",

  successTitle: "ধন্যবাদ, আপনার দান সম্পন্ন হয়েছে",
  successBody: "আপনার তথ্যটি যাচাই করে ইমেইলের মাধ্যমে জানানো হবে। রূপসা জনকল্যাণ ফাউন্ডেশনের সাথেই থাকুন।"
};

/* বহিরাগত স্ক্রিপ্ট (reCAPTCHA / confetti) একবারই লোড হবে, প্রতিবার পেজে ঢুকলে না */
RJF._loadScriptOnce = function (src, key) {
  RJF._loadedScripts = RJF._loadedScripts || {};
  if (RJF._loadedScripts[key]) return;
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
  RJF._loadedScripts[key] = true;
};

RJF.renderDonatePage = function () {
  var root = document.getElementById('donate-root');
  if (!root) return;
  var d = RJF.donateData;

  var amountBtnsHtml = d.amounts.map(function (amt) {
    return '<button type="button" class="amt-btn" data-amt="' + amt + '">' + amt + '৳</button>';
  }).join('');

  root.innerHTML =
    '<div class="donate-page">' +

      '<a class="legal-back" href="#/">' + RJF.iconSvg('up', 'fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(-90deg)"') + '<span>মূল পাতায় ফিরুন</span></a>' +

      '<section class="hero-strip">' +
        '<p class="kicker">' + d.kicker + '</p>' +
        '<h2>' + d.title + '</h2>' +
        '<p>' + d.desc + '</p>' +
      '</section>' +

      '<main class="dashboard-main">' +
        '<div class="donation-card">' +

          '<div id="successOverlay">' +
            '<div class="badge-ring"><i class="fa-solid fa-check"></i></div>' +
            '<h2>' + d.successTitle + '</h2>' +
            '<p>' + d.successBody + '</p>' +
            '<button type="button" class="copy-btn" id="doneBtn">সম্পন্ন</button>' +
          '</div>' +

          '<h2 class="card-title">দানের পদ্ধতি</h2>' +

          '<div class="pay-panel">' +
            '<span class="label">' + d.payLabel + '</span>' +
            '<span class="number" id="targetNum">' + d.payNumber + '</span>' +
            '<button type="button" class="copy-btn" id="copyBtn">নাম্বার কপি করুন</button>' +
          '</div>' +

          '<p class="subtitle">আপনার ফরমটি ভবিষ্যতের জন্য রেকর্ড করা হবে। অনুগ্রহ করে সঠিক তথ্য দিন।</p>' +

          '<form id="donateForm" novalidate>' +
            '<div class="hp-field" aria-hidden="true">' +
              '<label for="website">Website</label>' +
              '<input type="text" id="website" name="website" tabindex="-1" autocomplete="off">' +
            '</div>' +

            '<div class="field-group has-icon">' +
              '<input type="text" id="n" placeholder="Name (English)" required>' +
              '<i class="fa-solid fa-user field-icon"></i>' +
              '<div class="error-hint">⚠️ Give your correct name.</div>' +
            '</div>' +

            '<div class="field-group has-icon">' +
              '<input type="email" id="e" placeholder="Email Address" required>' +
              '<i class="fa-solid fa-envelope field-icon"></i>' +
              '<div class="error-hint">⚠️ Enter a valid email.</div>' +
            '</div>' +

            '<div class="amount-options">' + amountBtnsHtml + '</div>' +

            '<div class="field-group has-icon">' +
              '<input type="number" id="a" placeholder="Amount (৳)" required>' +
              '<i class="fa-solid fa-sack-dollar field-icon"></i>' +
              '<div class="error-hint">⚠️ Minimum amount is 30 taka.</div>' +
            '</div>' +

            '<div class="field-group has-icon">' +
              '<select id="m" required>' +
                '<option value="" disabled selected>Payment Method</option>' +
                '<option value="bKash">bKash</option>' +
                '<option value="Nagad">Nagad</option>' +
              '</select>' +
              '<i class="fa-solid fa-wallet field-icon"></i>' +
              '<div class="error-hint">⚠️ Select a payment method.</div>' +
            '</div>' +

            '<div class="field-group has-icon">' +
              '<input type="text" id="tx" placeholder="Transaction ID (TrxID)" required>' +
              '<i class="fa-solid fa-hashtag field-icon"></i>' +
              '<i class="fas fa-question-circle trx-guide" id="trxHelp" tabindex="0" role="button" aria-label="TrxID কী তা জানুন"></i>' +
              '<div class="error-hint">⚠️ পেমেন্ট SMS থেকে TrxID টি দিন।</div>' +
            '</div>' +

            '<div class="recaptcha-row"><div class="g-recaptcha" data-sitekey="' + d.recaptchaSiteKey + '"></div></div>' +
            '<div id="recaptcha-error" class="error-hint" style="text-align:center; margin-bottom:10px;">⚠️ দয়া করে রিক্যাপচা পূরণ করুন।</div>' +

            '<button type="submit" class="btn-submit" id="sBtn">' +
              '<span id="btnText">CONFIRM DONATION</span>' +
              '<div class="spinner" id="btnSpinner"></div>' +
            '</button>' +

            '<p class="trust-line"><i class="fa-solid fa-shield-halved"></i> তথ্য নিরাপদে সংরক্ষিত হয় ও সার্ভারে যাচাই করা হয়</p>' +
            '<p class="footer-msg">পেমেন্ট সম্পন্ন হওয়ার পর অ্যাডমিন ইমেইলের মাধ্যমে তা নিশ্চিত করবেন।</p>' +
          '</form>' +
        '</div>' +
      '</main>' +

      '<div id="donateToast">নাম্বারটি কপি করা হয়েছে!</div>' +
    '</div>';

  RJF._loadScriptOnce('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js', 'confetti');
  RJF._loadScriptOnce('https://www.google.com/recaptcha/api.js', 'recaptcha');

  RJF._wireDonateForm();
};

RJF._wireDonateForm = function () {
  var d = RJF.donateData;

  var trxHelp = document.getElementById('trxHelp');
  trxHelp.addEventListener('click', function () { alert(d.trxHelpText); });
  trxHelp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trxHelp.click(); }
  });

  var nInp = document.getElementById('n');
  var eInp = document.getElementById('e');
  var tInp = document.getElementById('tx');
  var aInp = document.getElementById('a');
  var mSel = document.getElementById('m');

  nInp.addEventListener('input', function () { this.value = this.value.replace(/[^a-zA-Z\s.]/g, ''); });
  tInp.addEventListener('input', function () { this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });

  document.querySelectorAll('.amt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.amt-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      aInp.value = btn.dataset.amt;
    });
  });
  aInp.addEventListener('input', function () {
    document.querySelectorAll('.amt-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.amt === aInp.value); });
  });

  document.getElementById('copyBtn').addEventListener('click', function () {
    var num = document.getElementById('targetNum').textContent;
    navigator.clipboard.writeText(num).then(function () {
      var toast = document.getElementById('donateToast');
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 2000);
    });
  });

  function resetDonateForm() {
    var form = document.getElementById('donateForm');
    form.reset();
    document.getElementById('successOverlay').style.display = 'none';
    document.querySelectorAll('.amt-btn').forEach(function (b) { b.classList.remove('active'); });

    var sBtn = document.getElementById('sBtn');
    var spinner = document.getElementById('btnSpinner');
    var btnText = document.getElementById('btnText');
    sBtn.disabled = false;
    btnText.textContent = 'CONFIRM DONATION';
    spinner.style.display = 'none';

    document.querySelectorAll('input, select').forEach(function (i) { i.classList.remove('invalid-signal'); });

    if (typeof grecaptcha !== 'undefined') { try { grecaptcha.reset(); } catch (err) {} }
  }
  document.getElementById('doneBtn').addEventListener('click', resetDonateForm);

  document.getElementById('donateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    /* honeypot — মানুষ এই ফিল্ড দেখে না, বট ভরে ফেলে; ভরা থাকলে চুপচাপ বাতিল */
    var honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') return;

    var recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
    var recaptchaError = document.getElementById('recaptcha-error');
    if (!recaptchaResponse || recaptchaResponse.length === 0) {
      recaptchaError.style.display = 'block';
      return;
    }
    recaptchaError.style.display = 'none';

    var isN = /^[a-zA-Z\s.]{3,50}$/.test(nInp.value);
    var isE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eInp.value);
    var isA = Number(aInp.value) >= 30;
    var isM = mSel.value !== '';
    var isT = tInp.value.trim().length >= 8;

    [[nInp, isN], [eInp, isE], [aInp, isA], [mSel, isM], [tInp, isT]].forEach(function (pair) {
      pair[0].classList.toggle('invalid-signal', !pair[1]);
    });

    if (!(isN && isE && isA && isM && isT)) return;

    var btn = document.getElementById('sBtn');
    var spinner = document.getElementById('btnSpinner');
    var btnText = document.getElementById('btnText');

    btnText.textContent = 'Processing...';
    spinner.style.display = 'block';
    btn.disabled = true;

    fetch(d.scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        name: nInp.value,
        email: eInp.value,
        amount: aInp.value,
        method: mSel.value,
        trx: tInp.value.trim(),
        recaptchaToken: recaptchaResponse
      })
    }).then(function () {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
      document.getElementById('successOverlay').style.display = 'flex';
    }).catch(function () {
      btnText.textContent = 'CONFIRM DONATION';
      spinner.style.display = 'none';
      btn.disabled = false;
      alert('দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    });
  });
};
