/* ভাসমান স্মার্ট ফিডব্যাক বাটন + Firestore-ভিত্তিক রিভিউ সিস্টেম
   (ডোনেশন পেজের মতোই সম্পূর্ণ জাভাস্ক্রিপ্ট দিয়ে তৈরি — index.html-এ শুধু #feedback-root, কোনো HTML নেই)
   ডেটা স্কিম আগের রিভিউ পেজের সাথে মিলিয়ে রাখা হয়েছে: userName, userEmail, comment, rating, timestamp
   (যাতে আগে যারা রিভিউ দিয়েছেন তাদের নাম-মতামত ঠিকভাবে দেখা যায়) */
window.RJF = window.RJF || {};

RJF.feedbackData = {
  reviewConfig: {
    apiKey: "AIzaSyDC0H-DW3avFnMRmipaI3qSyYLnb2B3CEU",
    authDomain: "rating-revieww.firebaseapp.com",
    projectId: "rating-revieww",
    appId: "1:936802340652:web:9283ff8a9ffcbee6686689"
  },
  collectionName: "reviews",
  fetchLimit: 50,
  pageSize: 5
};

RJF._fbState = {
  db: null,
  docs: [],
  visibleCount: 5,
  existingId: null,
  rating: 0,
  unsubscribe: null
};

/* --- আগের ও নতুন দুই ধরনের ফিল্ড নাম থেকেই সঠিক ভ্যালু বের করা (ব্যাকওয়ার্ড কম্প্যাটিবিলিটি) --- */
RJF._fbReviewName = function (r) { return r.userName || r.name || 'নামহীন'; };
RJF._fbReviewEmail = function (r) { return r.userEmail || r.email || ''; };
RJF._fbReviewText = function (r) { return r.comment || r.message || ''; };

/* Firebase compat SDK একবারই লোড হবে */
RJF._loadFirebase = function (cb) {
  if (window.firebase && window.firebase.apps) { cb(); return; }
  RJF._loadScriptOnce('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js', 'fb-app');
  RJF._loadScriptOnce('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js', 'fb-firestore');
  var check = setInterval(function () {
    if (window.firebase && window.firebase.firestore) {
      clearInterval(check);
      cb();
    }
  }, 100);
};

RJF._getDb = function () {
  if (RJF._fbState.db) return RJF._fbState.db;
  var app = window.firebase.apps.length
    ? window.firebase.apps[0]
    : window.firebase.initializeApp(RJF.feedbackData.reviewConfig);
  RJF._fbState.db = window.firebase.firestore(app);
  return RJF._fbState.db;
};

RJF.renderFeedback = function () {
  var root = document.getElementById('feedback-root');
  if (!root) return;

  root.innerHTML =
    '<div class="fb-tip" id="fbTip">আপনার মতামত জানান</div>' +
    '<button class="fb-btn pulse" id="fbBtn">' + RJF.iconSvg('chat') + '<span class="fb-btn-label">ফিডব্যাক দিন</span></button>' +
    '<div class="fb-overlay" id="fbOverlay">' +
      '<div class="fb-panel">' +
        '<button class="fb-close" id="fbClose" aria-label="বন্ধ করুন">' + RJF.iconSvg('close', 'width="16" height="16" fill="none" stroke="#1A2420" stroke-width="2"') + '</button>' +
        '<h3>আপনার মতামত জানান</h3>' +
        '<p>আমাদের কার্যক্রম সম্পর্কে আপনার অভিজ্ঞতা ও পরামর্শ শেয়ার করুন।</p>' +

        '<div class="fb-summary hidden" id="fbSummary">' +
          '<div class="fb-summary-score">' +
            '<span id="fbAvgValue">0.0</span>' +
            '<div class="fb-summary-stars" id="fbAvgStars"></div>' +
            '<small id="fbAvgCount">0টি রিভিউ</small>' +
          '</div>' +
          '<div class="fb-summary-bars" id="fbBars"></div>' +
        '</div>' +

        '<form id="fbForm">' +
          '<div class="fb-field"><label for="fbName">নাম</label><input type="text" id="fbName" placeholder="আপনার নাম" required></div>' +
          '<div class="fb-field"><label for="fbEmail">ইমেইল</label><input type="email" id="fbEmail" placeholder="আপনার ইমেইল" required>' +
            '<small class="fb-hint">এই ইমেইল দিয়ে পরে আপনার রিভিউ এডিট/ডিলিট করতে পারবেন</small>' +
          '</div>' +
          '<div class="fb-field"><label>রেটিং</label><div class="fb-stars" id="fbStars">' +
            [1, 2, 3, 4, 5].map(function (v) { return '<button type="button" data-v="' + v + '">' + RJF.iconSvg('star', 'fill="currentColor"') + '</button>'; }).join('') +
          '</div></div>' +
          '<div class="fb-field"><label for="fbMsg">মতামত</label><textarea id="fbMsg" rows="3" placeholder="আপনার মতামত লিখুন..." required></textarea></div>' +
          '<div class="fb-form-actions">' +
            '<button type="button" class="fb-delete" id="fbDeleteBtn" style="display:none">মুছে ফেলুন</button>' +
            '<button type="submit" class="fb-submit" id="fbSubmitBtn">জমা দিন</button>' +
          '</div>' +
        '</form>' +

        '<div class="fb-divider">সকল মতামত</div>' +
        '<div class="fb-reviews" id="fbReviews"><p class="fb-empty" id="fbEmptyMsg">এখনও কোনো রিভিউ নেই।</p></div>' +
        '<button type="button" class="fb-load-more" id="fbLoadMoreBtn" style="display:none">আরও দেখুন</button>' +
      '</div>' +
    '</div>' +
    '<div class="fb-toast" id="fbToast">ধন্যবাদ! আপনার মতামত পাঠানো হয়েছে।</div>';

  var fbTip = document.getElementById('fbTip');
  setTimeout(function () { fbTip.classList.add('show'); }, 3000);
  setTimeout(function () { fbTip.classList.remove('show'); }, 8000);

  RJF._wireFeedback();
};

RJF._fbShowToast = function (msg, isError) {
  var toast = document.getElementById('fbToast');
  toast.textContent = msg;
  toast.classList.toggle('fb-toast-error', !!isError);
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3200);
};

RJF._fbStarsHtml = function (rating, size) {
  var cls = size === 'sm' ? ' fb-star-sm' : '';
  var out = '';
  for (var i = 1; i <= 5; i++) {
    out += '<span class="' + (i <= rating ? 'on' : '') + cls + '">' + RJF.iconSvg('star', 'fill="currentColor"') + '</span>';
  }
  return out;
};

RJF._wireFeedback = function () {
  var d = RJF.feedbackData;
  var st = RJF._fbState;
  st.visibleCount = d.pageSize;
  st.existingId = null;
  st.rating = 0;

  var fbBtn = document.getElementById('fbBtn');
  var fbTip = document.getElementById('fbTip');
  var fbOverlay = document.getElementById('fbOverlay');
  var fbClose = document.getElementById('fbClose');
  var fbForm = document.getElementById('fbForm');
  var fbStars = document.getElementById('fbStars');
  var nameInp = document.getElementById('fbName');
  var emailInp = document.getElementById('fbEmail');
  var msgInp = document.getElementById('fbMsg');
  var submitBtn = document.getElementById('fbSubmitBtn');
  var deleteBtn = document.getElementById('fbDeleteBtn');
  var reviewsBox = document.getElementById('fbReviews');
  var emptyMsg = document.getElementById('fbEmptyMsg');
  var loadMoreBtn = document.getElementById('fbLoadMoreBtn');
  var summaryBox = document.getElementById('fbSummary');

  function openFb() {
    fbOverlay.classList.add('open');
    fbBtn.classList.remove('pulse');
    fbTip.classList.remove('show');
    RJF._loadFirebase(function () { RJF._fbSubscribeReviews(); });
  }
  function closeFb() { fbOverlay.classList.remove('open'); }

  fbBtn.addEventListener('click', openFb);
  fbClose.addEventListener('click', closeFb);
  fbOverlay.addEventListener('click', function (e) { if (e.target === fbOverlay) closeFb(); });

  function setRating(v) {
    st.rating = v;
    fbStars.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('active', Number(b.dataset.v) <= v);
    });
  }
  fbStars.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () { setRating(Number(btn.dataset.v)); });
  });

  function resetForm() {
    fbForm.reset();
    setRating(0);
    st.existingId = null;
    submitBtn.textContent = 'জমা দিন';
    deleteBtn.style.display = 'none';
  }

  /* ইমেইল দিয়ে নিজের আগের রিভিউ খুঁজে বের করা — আগে যেসব রিভিউ ইতিমধ্যে লোড হয়ে গেছে (st.docs)
     তার মধ্যেই খোঁজা হয়, তাই পুরনো (userEmail) ও নতুন (email) দুই ধরনের ডেটাতেই কাজ করে */
  function findExistingByEmail(email) {
    var lower = email.toLowerCase();
    for (var i = 0; i < st.docs.length; i++) {
      var r = st.docs[i];
      var rEmail = RJF._fbReviewEmail(r).toLowerCase();
      if (rEmail === lower) return r;
    }
    return null;
  }

  emailInp.addEventListener('blur', function () {
    var email = emailInp.value.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return;

    RJF._loadFirebase(function () {
      RJF._fbSubscribeReviews(); /* নিশ্চিত করা যে রিভিউ লোড হয়েছে */
      var tryFind = function () {
        var match = findExistingByEmail(email);
        if (match) {
          st.existingId = match.id;
          nameInp.value = RJF._fbReviewName(match);
          msgInp.value = RJF._fbReviewText(match);
          setRating(match.rating || 0);
          submitBtn.textContent = 'আপডেট করুন';
          deleteBtn.style.display = 'inline-flex';
          RJF._fbShowToast('আপনার আগের রিভিউ পাওয়া গেছে, চাইলে এডিট করুন', false);
        } else {
          st.existingId = null;
          submitBtn.textContent = 'জমা দিন';
          deleteBtn.style.display = 'none';
        }
      };
      if (st.docs.length) { tryFind(); } else { setTimeout(tryFind, 700); }
    });
  });

  deleteBtn.addEventListener('click', function () {
    if (!st.existingId) return;
    if (!confirm('আপনি কি নিশ্চিত যে আপনার রিভিউটি মুছে ফেলতে চান?')) return;
    var db = RJF._getDb();
    db.collection(d.collectionName).doc(st.existingId).delete()
      .then(function () {
        RJF._fbShowToast('রিভিউ মুছে ফেলা হয়েছে', false);
        resetForm();
      })
      .catch(function () { RJF._fbShowToast('মুছতে সমস্যা হয়েছে, আবার চেষ্টা করুন', true); });
  });

  fbForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameInp.value.trim();
    var email = emailInp.value.trim();
    var message = msgInp.value.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { RJF._fbShowToast('আপনার নাম লিখুন', true); nameInp.focus(); return; }
    if (!emailPattern.test(email)) { RJF._fbShowToast('সঠিক ইমেইল দিন', true); emailInp.focus(); return; }
    if (st.rating < 1) { RJF._fbShowToast('একটি রেটিং বেছে নিন', true); return; }
    if (!message) { RJF._fbShowToast('আপনার মতামত লিখুন', true); msgInp.focus(); return; }

    submitBtn.disabled = true;
    var wasUpdating = !!st.existingId;
    submitBtn.textContent = wasUpdating ? 'আপডেট হচ্ছে...' : 'জমা হচ্ছে...';

    RJF._loadFirebase(function () {
      var db = RJF._getDb();
      /* পুরনো রিভিউ পেজের সাথে মিলিয়ে একই ফিল্ড নাম ব্যবহার করা হচ্ছে (userName, userEmail, comment) */
      var payload = {
        userName: name,
        userEmail: email,
        rating: st.rating,
        comment: message,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
      };

      var task = wasUpdating
        ? db.collection(d.collectionName).doc(st.existingId).update(payload)
        : db.collection(d.collectionName).add(payload);

      task.then(function () {
        RJF._fbShowToast(wasUpdating ? 'রিভিউ আপডেট হয়েছে!' : 'ধন্যবাদ! আপনার মতামত পাঠানো হয়েছে।', false);
        closeFb();
        resetForm();
      }).catch(function () {
        RJF._fbShowToast('সংরক্ষণ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন', true);
      }).finally(function () {
        submitBtn.disabled = false;
        if (submitBtn.textContent.indexOf('হচ্ছে') !== -1) {
          submitBtn.textContent = st.existingId ? 'আপডেট করুন' : 'জমা দিন';
        }
      });
    });
  });

  loadMoreBtn.addEventListener('click', function () {
    st.visibleCount += d.pageSize;
    RJF._fbRenderList();
  });

  RJF._fbRenderList = function () {
    var docs = st.docs;

    if (!docs.length) {
      summaryBox.classList.add('hidden');
      emptyMsg.style.display = 'block';
      reviewsBox.innerHTML = '';
      reviewsBox.appendChild(emptyMsg);
      loadMoreBtn.style.display = 'none';
      return;
    }

    /* --- এভারেজ রেটিং সামারি --- */
    var total = docs.length;
    var sum = 0;
    var counts = [0, 0, 0, 0, 0];
    docs.forEach(function (r) {
      sum += (r.rating || 0);
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    var avg = (sum / total).toFixed(1);

    summaryBox.classList.remove('hidden');
    document.getElementById('fbAvgValue').textContent = avg;
    document.getElementById('fbAvgStars').innerHTML = RJF._fbStarsHtml(Math.round(avg));
    document.getElementById('fbAvgCount').textContent = total + 'টি রিভিউ';

    var barsHtml = '';
    for (var star = 5; star >= 1; star--) {
      var c = counts[star - 1];
      var pct = total ? Math.round((c / total) * 100) : 0;
      barsHtml +=
        '<div class="fb-bar-row">' +
          '<span class="fb-bar-label">' + star + RJF.iconSvg('star', 'fill="currentColor" width="11" height="11"') + '</span>' +
          '<span class="fb-bar-track"><span class="fb-bar-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="fb-bar-pct">' + pct + '%</span>' +
        '</div>';
    }
    document.getElementById('fbBars').innerHTML = barsHtml;

    /* --- রিভিউ লিস্ট --- */
    var visible = docs.slice(0, st.visibleCount);
    reviewsBox.innerHTML = visible.map(function (r) {
      var name = RJF._fbReviewName(r);
      var text = RJF._fbReviewText(r);
      var initial = name.trim().charAt(0).toUpperCase() || '?';
      var dateStr = '';
      if (r.timestamp && r.timestamp.toDate) {
        dateStr = r.timestamp.toDate().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return (
        '<div class="fb-review-item">' +
          '<div class="fb-review-top">' +
            '<div class="fb-review-avatar">' + initial + '</div>' +
            '<div class="fb-review-namebox">' +
              '<span class="fb-review-name">' + RJF._escapeHtml(name) + '</span>' +
              '<span class="fb-review-stars">' + RJF._fbStarsHtml(r.rating, 'sm') + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="fb-review-text">' + RJF._escapeHtml(text) + '</p>' +
          (dateStr ? '<small class="fb-review-date">' + dateStr + '</small>' : '') +
        '</div>'
      );
    }).join('');

    loadMoreBtn.style.display = st.visibleCount < docs.length ? 'block' : 'none';
  };
};

RJF._escapeHtml = function (str) {
  var div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
};

RJF._fbSubscribeReviews = function () {
  var d = RJF.feedbackData;
  var st = RJF._fbState;
  if (st.unsubscribe) return; /* একবারই সাবস্ক্রাইব করলেই যথেষ্ট */

  var db = RJF._getDb();
  st.unsubscribe = db.collection(d.collectionName)
    .orderBy('timestamp', 'desc')
    .limit(d.fetchLimit)
    .onSnapshot(function (snapshot) {
      st.docs = snapshot.docs.map(function (doc) {
        var data = doc.data();
        data.id = doc.id;
        return data;
      });
      if (typeof RJF._fbRenderList === 'function') RJF._fbRenderList();
    }, function () {
      RJF._fbShowToast('রিভিউ লোড করতে সমস্যা হয়েছে', true);
    });
};
