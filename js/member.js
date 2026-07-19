/* স্থায়ী কমিটি ও সাধারণ সদস্য পেজ — index.html-এ এই ফাইলের প্রভাব নেই, #/member রুটে render হয়
   (আগের standalone member/index.html + app.js/scrollbox.js/live-counter.js/effects.js এখন এই একটা মডিউলে) */
window.RJF = window.RJF || {};

RJF._member = {
  scrollPos: 0,
  autoSpeed: 0.55,
  isPaused: false,
  isDragging: false,
  lastTime: 0,
  velocity: 0,
  dragStartY: 0,
  dragStartScroll: 0,
  lastDragY: 0,
  lastDragTime: 0,
  resumeTimer: null,
  manualScrollInterval: null,
  loopEnabled: false,
  rafId: null,
  wired: false,
  typeTimer: null
};

RJF._toBengaliNumber = function (num) {
  var bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(function (d) { return /\d/.test(d) ? bn[d] : d; }).join('');
};

RJF.renderMemberPage = function () {
  var root = document.getElementById('member-root');
  if (!root) return;

  var categoryOptionsHtml = RJF.MEMBER_CATEGORY_ORDER.map(function (cat) {
    return '<option value="' + cat + '">' + cat + '</option>';
  }).join('');

  root.innerHTML =
    '<div class="member-page">' +

      '<a class="member-back-box" href="#/">' + RJF.iconSvg('up', 'fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(-90deg)"') + '<span>মূল পাতায় ফিরুন</span></a>' +

      '<div class="hero-banner">' +
        '<div class="banner-content">' +
          '<span class="eyebrow">RJ FOUNDATION</span>' +
          '<h1>রূপসা জনকল্যাণ ফাউন্ডেশন</h1>' +
          '<p>স্থায়ী কমিটি ও সাধারণ সদস্যবৃন্দ</p>' +
        '</div>' +
        '<div class="particles"><div class="particle"></div><div class="particle"></div><div class="particle"></div></div>' +
      '</div>' +

      '<div class="live-counter-wrapper">' +
        '<div class="live-widget">' +
          '<div class="live-indicator"><span class="pulse"></span></div>' +
          '<div class="live-text"><i class="fa-solid fa-eye"></i>এখন দেখছে</div>' +
          '<div class="live-count-box"><span id="active-users">0</span> জন</div>' +
        '</div>' +
      '</div>' +

      '<div class="stats-grid">' +
        '<div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-users"></i></div><div class="stat-value" id="stat-total">0</div><div class="stat-label">মোট সদস্য</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div><div class="stat-value" id="stat-active">0</div><div class="stat-label">সক্রিয় সদস্য</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-id-card"></i></div><div class="stat-value" id="stat-verified">0</div><div class="stat-label">ভেরিফাইড আইডি</div></div>' +
        '<div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-sitemap"></i></div><div class="stat-value" id="stat-categories">0</div><div class="stat-label">বিভাগ / পদবী</div></div>' +
      '</div>' +

      '<div class="controls-container">' +
        '<input type="text" id="searchInput" class="search-bar" placeholder="নাম লিখে খুঁজুন...">' +
        '<select id="categoryFilter" class="category-filter">' +
          '<option value="all">সবাই</option>' +
          categoryOptionsHtml +
        '</select>' +
      '</div>' +
      '<p class="result-count" id="result-count"></p>' +

      '<div class="scroll-frame-wrapper">' +
        '<div class="member-scroll-box" id="scroll-box"><div class="scroll-wrapper" id="scroll-content"></div></div>' +
        '<div class="scroll-controls">' +
          '<button type="button" class="scroll-btn" id="memberScrollUp" aria-label="উপরে স্ক্রল করুন"><i class="fa-solid fa-chevron-up"></i></button>' +
          '<button type="button" class="scroll-btn" id="memberScrollDown" aria-label="নিচে স্ক্রল করুন"><i class="fa-solid fa-chevron-down"></i></button>' +
        '</div>' +
      '</div>' +
      '<p class="frame-hint"><i class="fa-solid fa-hand-pointer"></i> ধরে টেনে বা স্ক্রল করে সবাইকে দেখুন</p>' +

      '<div class="modal-overlay" id="modal">' +
        '<div class="modal-content" id="memberModalContent">' +
          '<div class="modal-close-icon" id="memberModalClose">&times;</div>' +
          '<img id="modal-img" src="" alt="Profile">' +
          '<h2 id="modal-name">নাম</h2>' +
          '<h4 id="modal-role">পদবী</h4>' +
          '<span class="modal-status" id="modal-status"></span>' +
          '<p id="modal-desc">বিবরণ</p>' +
          '<a href="#" id="modal-member-link" target="_blank" rel="noopener" style="text-decoration:none;">' +
            '<button type="button" id="modal-memberid" class="modal-id-btn">মেম্বার আইডি</button>' +
          '</a>' +
          '<div class="social-links" id="modal-social"></div>' +
          '<button type="button" class="close-btn" id="memberModalCloseBtn">বন্ধ করুন</button>' +
        '</div>' +
      '</div>' +

      '<button type="button" class="scroll-top-btn" id="memberScrollTopBtn" title="উপরে যান"><i class="fa-solid fa-arrow-up"></i></button>' +

      '<footer class="member-foot"><p>&copy; <span id="memberYear"></span> <strong>রূপসা জনকল্যাণ ফাউন্ডেশন (RJ Foundation)</strong> — সর্বস্বত্ব সংরক্ষিত।</p></footer>' +

      '<canvas id="member-snow"></canvas>' +
    '</div>';

  document.getElementById('memberYear').textContent = new Date().getFullYear();

  RJF._loadScriptOnce('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js', 'firebase-app');
  RJF._loadScriptOnce('https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js', 'firebase-database');

  RJF._wireMemberPage();
};

RJF._wireMemberPage = function () {
  var s = RJF._member;
  var scrollContent = document.getElementById('scroll-content');
  var scrollBox = document.getElementById('scroll-box');
  var modal = document.getElementById('modal');
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var resultCount = document.getElementById('result-count');
  var MIN_MEMBERS_FOR_LOOP = 5;

  function sortByCategoryOrder(list) {
    return list.slice().sort(function (a, b) {
      var ia = RJF.MEMBER_CATEGORY_ORDER.indexOf(a.category);
      var ib = RJF.MEMBER_CATEGORY_ORDER.indexOf(b.category);
      if (ia === -1) ia = RJF.MEMBER_CATEGORY_ORDER.length;
      if (ib === -1) ib = RJF.MEMBER_CATEGORY_ORDER.length;
      return ia - ib;
    });
  }

  function memberCardHtml(member) {
    var statusColor = member.status === 'active' ? '#7A9B6E' : '#C1632F';
    var statusLabel = member.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়';
    var verifiedBadge = (member.memberid && member.memberid.trim() !== '')
      ? '<span class="verified-badge" title="ভেরিফাইড সদস্য"><i class="fa-solid fa-circle-check"></i></span>'
      : '';
    return (
      '<div class="member-card" tabindex="0" role="button" aria-label="' + member.name + ' - বিস্তারিত দেখুন" data-member-id="' + member.id + '">' +
        '<div class="img-wrapper">' +
          '<img src="' + member.image + '" alt="' + member.name + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/150\'">' +
          '<span class="status-dot" style="background-color:' + statusColor + ';" title="' + statusLabel + '"></span>' +
          verifiedBadge +
        '</div>' +
        '<div class="member-info"><h3>' + member.name + '</h3><p>' + member.role + '</p></div>' +
        '<div class="arrow-icon"><i class="fa-solid fa-arrow-right"></i></div>' +
      '</div>'
    );
  }

  function resetScrollPosition() {
    s.scrollPos = 0;
    s.velocity = 0;
    applyTransform();
  }

  function applyTransform() {
    if (scrollContent) scrollContent.style.transform = 'translateY(' + s.scrollPos + 'px)';
  }

  function renderMembers(dataToRender) {
    dataToRender = dataToRender || RJF.memberList;
    if (dataToRender.length === 0) {
      scrollContent.innerHTML = '<div class="empty-state show"><i class="fa-solid fa-user-slash"></i><p>কোনো সদস্য পাওয়া যায়নি</p></div>';
      resultCount.textContent = '০ জন সদস্য পাওয়া গেছে';
      s.loopEnabled = false;
      resetScrollPosition();
      return;
    }

    resultCount.textContent = RJF._toBengaliNumber(dataToRender.length) + ' জন সদস্য পাওয়া গেছে';

    var sortedList = sortByCategoryOrder(dataToRender);
    var cardsHtml = sortedList.map(memberCardHtml).join('');

    if (sortedList.length >= MIN_MEMBERS_FOR_LOOP) {
      scrollContent.innerHTML = cardsHtml + cardsHtml;
      s.loopEnabled = true;
    } else {
      scrollContent.innerHTML = cardsHtml;
      s.loopEnabled = false;
    }
    resetScrollPosition();
  }

  function filterData() {
    var searchText = searchInput.value.toLowerCase().trim();
    var categoryText = categoryFilter.value;
    var filtered = RJF.memberList.filter(function (member) {
      var matchesSearch = member.name.toLowerCase().indexOf(searchText) !== -1 || member.role.toLowerCase().indexOf(searchText) !== -1;
      var matchesCategory = (categoryText === 'all') || (member.category === categoryText);
      return matchesSearch && matchesCategory;
    });
    renderMembers(filtered);
  }

  function renderStats() {
    var total = RJF.memberList.length;
    var active = RJF.memberList.filter(function (m) { return m.status === 'active'; }).length;
    var verified = RJF.memberList.filter(function (m) { return m.memberid && m.memberid.trim() !== ''; }).length;
    var categories = {};
    RJF.memberList.forEach(function (m) { categories[m.category] = true; });
    var categoryCount = Object.keys(categories).length;

    var statMap = { 'stat-total': total, 'stat-active': active, 'stat-verified': verified, 'stat-categories': categoryCount };
    Object.keys(statMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      animateCount(el, statMap[id]);
    });
  }

  function animateCount(el, target) {
    var current = 0;
    var duration = 900;
    var stepTime = Math.max(Math.floor(duration / Math.max(target, 1)), 20);
    var timer = setInterval(function () {
      current++;
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, stepTime);
  }

  function openMemberModal(id) {
    var member = RJF.memberList.filter(function (m) { return m.id === id; })[0];
    if (!member) return;

    document.getElementById('modal-name').innerText = member.name;
    document.getElementById('modal-role').innerText = member.role;
    document.getElementById('modal-img').src = member.image;
    document.getElementById('modal-desc').innerText = (member.desc && member.desc !== 'none') ? member.desc : 'এই সদস্যের বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হবে।';

    var statusBadge = document.getElementById('modal-status');
    var isActive = member.status === 'active';
    statusBadge.innerText = isActive ? '● সক্রিয় সদস্য' : '● নিষ্ক্রিয় সদস্য';
    statusBadge.style.color = isActive ? '#7A9B6E' : '#C1632F';

    var memberIdBtn = document.getElementById('modal-memberid');
    var memberLink = document.getElementById('modal-member-link');
    if (member.memberid && member.memberid.trim() !== '') {
      memberIdBtn.innerText = 'মেম্বার আইডি: ' + member.memberid.trim();
      memberLink.href = member.profileUrl || '#';
      memberLink.style.display = 'inline-block';
    } else {
      memberLink.style.display = 'none';
    }

    var socialHtml = '';
    if (member.facebook) socialHtml += '<a href="' + member.facebook + '" target="_blank" rel="noopener" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>';
    if (member.whatsapp) socialHtml += '<a href="' + member.whatsapp + '" target="_blank" rel="noopener" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>';
    if (member.github && member.github.trim() !== '') socialHtml += '<a href="' + member.github + '" target="_blank" rel="noopener" title="GitHub"><i class="fa-brands fa-github"></i></a>';
    document.getElementById('modal-social').innerHTML = socialHtml;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function toggleModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  scrollContent.addEventListener('click', function (e) {
    var card = e.target.closest('.member-card');
    if (card) openMemberModal(Number(card.dataset.memberId));
  });
  scrollContent.addEventListener('keypress', function (e) {
    if (e.key !== 'Enter') return;
    var card = e.target.closest('.member-card');
    if (card) openMemberModal(Number(card.dataset.memberId));
  });

  modal.addEventListener('click', function (e) { if (e.target === modal) toggleModal(); });
  document.getElementById('memberModalClose').addEventListener('click', toggleModal);
  document.getElementById('memberModalCloseBtn').addEventListener('click', toggleModal);
  document.getElementById('memberModalContent').addEventListener('click', function (e) { e.stopPropagation(); });

  searchInput.addEventListener('keyup', filterData);
  categoryFilter.addEventListener('change', filterData);

  /* --- অটো-টাইপিং প্লেসহোল্ডার --- */
  var placeholderTexts = ["নাম লিখে খুঁজুন...", "সভাপতি খুঁজুন...", "সাধারণ সম্পাদক খুঁজুন...", "কোষাধ্যক্ষ খুঁজুন...", "সদস্যদের খুঁজুন..."];
  var textIndex = 0, charIndex = 0, isDeletingText = false;
  function typeEffect() {
    var memberRoot = document.getElementById('member-root');
    if (!memberRoot || memberRoot.hidden) return; // রুট ছেড়ে গেলে টাইপিং লুপ বন্ধ
    if (document.activeElement === searchInput || searchInput.value.length > 0) {
      searchInput.setAttribute('placeholder', 'নাম লিখে খুঁজুন...');
      s.typeTimer = setTimeout(typeEffect, 1000);
      return;
    }
    var currentText = placeholderTexts[textIndex];
    if (isDeletingText) {
      searchInput.setAttribute('placeholder', currentText.substring(0, charIndex - 1));
      charIndex--;
    } else {
      searchInput.setAttribute('placeholder', currentText.substring(0, charIndex + 1));
      charIndex++;
    }
    var typeSpeed = isDeletingText ? 50 : 100;
    if (!isDeletingText && charIndex === currentText.length) {
      typeSpeed = 1500; isDeletingText = true;
    } else if (isDeletingText && charIndex === 0) {
      isDeletingText = false; textIndex = (textIndex + 1) % placeholderTexts.length; typeSpeed = 500;
    }
    s.typeTimer = setTimeout(typeEffect, typeSpeed);
  }

  /* --- স্ক্রল-টু-টপ --- */
  var scrollBtn = document.getElementById('memberScrollTopBtn');
  function onWindowScroll() {
    var memberRoot = document.getElementById('member-root');
    if (!memberRoot || memberRoot.hidden) return;
    scrollBtn.classList.toggle('show', window.pageYOffset > 400);
  }
  window.addEventListener('scroll', onWindowScroll);
  scrollBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* --- মেম্বার ফ্রেমের স্মার্ট স্ক্রলিং (অটো + ড্র্যাগ + হুইল) --- */
  function getHalfHeight() { return scrollContent ? scrollContent.scrollHeight / 2 : 0; }

  function wrapScrollPos() {
    if (!s.loopEnabled) return;
    var halfHeight = getHalfHeight();
    if (halfHeight <= 0) return;
    while (s.scrollPos <= -halfHeight) s.scrollPos += halfHeight;
    while (s.scrollPos > 0) s.scrollPos -= halfHeight;
  }

  function scheduleResume(delay) {
    clearTimeout(s.resumeTimer);
    s.resumeTimer = setTimeout(function () {
      if (!s.isDragging && !(modal && modal.classList.contains('active'))) s.isPaused = false;
    }, delay || 1200);
  }

  function autoScrollLoop(time) {
    var memberRoot = document.getElementById('member-root');
    if (!memberRoot || memberRoot.hidden) { s.rafId = null; s.lastTime = 0; return; } // রুট ছেড়ে গেলে লুপ থামিয়ে দেওয়া হয়

    if (!s.lastTime) s.lastTime = time;
    var deltaTime = Math.min(time - s.lastTime, 50);
    s.lastTime = time;

    if (s.isDragging) {
      // pointermove হ্যান্ডেল করে
    } else if (Math.abs(s.velocity) > 0.03) {
      s.scrollPos += s.velocity * (deltaTime / 16.67);
      s.velocity *= 0.94;
      wrapScrollPos();
      applyTransform();
    } else if (!s.isPaused && s.loopEnabled) {
      s.scrollPos -= s.autoSpeed * (deltaTime / 16.67);
      wrapScrollPos();
      applyTransform();
    }
    s.rafId = requestAnimationFrame(autoScrollLoop);
  }

  scrollBox.addEventListener('mouseenter', function () { s.isPaused = true; clearTimeout(s.resumeTimer); });
  scrollBox.addEventListener('mouseleave', function () { if (!s.isDragging) scheduleResume(250); });

  scrollBox.addEventListener('pointerdown', function (e) {
    s.isDragging = true; s.isPaused = true; s.velocity = 0;
    s.dragStartY = e.clientY; s.dragStartScroll = s.scrollPos;
    s.lastDragY = e.clientY; s.lastDragTime = performance.now();
    scrollBox.classList.add('dragging');
    try { scrollBox.setPointerCapture(e.pointerId); } catch (err) {}
  });
  scrollBox.addEventListener('pointermove', function (e) {
    if (!s.isDragging) return;
    var delta = e.clientY - s.dragStartY;
    s.scrollPos = s.dragStartScroll + delta;
    wrapScrollPos();
    applyTransform();
    var now = performance.now();
    var dt = now - s.lastDragTime;
    if (dt > 0) s.velocity = ((e.clientY - s.lastDragY) / dt) * 16.67;
    s.lastDragY = e.clientY; s.lastDragTime = now;
  });
  function endDrag(e) {
    if (!s.isDragging) return;
    s.isDragging = false;
    scrollBox.classList.remove('dragging');
    try { scrollBox.releasePointerCapture(e.pointerId); } catch (err) {}
    scheduleResume(1000);
  }
  scrollBox.addEventListener('pointerup', endDrag);
  scrollBox.addEventListener('pointercancel', endDrag);

  scrollBox.addEventListener('wheel', function (e) {
    e.preventDefault();
    s.isPaused = true; s.velocity = 0;
    s.scrollPos -= e.deltaY * 0.55;
    wrapScrollPos();
    applyTransform();
    scheduleResume(1100);
  }, { passive: false });

  function startManualScroll(direction) {
    s.isPaused = true; s.velocity = 0;
    clearInterval(s.manualScrollInterval);
    s.manualScrollInterval = setInterval(function () {
      s.scrollPos -= direction * 4;
      wrapScrollPos();
      applyTransform();
    }, 16);
  }
  function stopManualScroll() {
    clearInterval(s.manualScrollInterval);
    scheduleResume(800);
  }

  var upBtn = document.getElementById('memberScrollUp');
  var downBtn = document.getElementById('memberScrollDown');
  ['mousedown', 'touchstart'].forEach(function (evt) {
    upBtn.addEventListener(evt, function () { startManualScroll(-1); });
    downBtn.addEventListener(evt, function () { startManualScroll(1); });
  });
  ['mouseup', 'mouseleave', 'touchend'].forEach(function (evt) {
    upBtn.addEventListener(evt, stopManualScroll);
    downBtn.addEventListener(evt, stopManualScroll);
  });

  /* --- লাইভ ভিজিটর কাউন্টার (Firebase) --- */
  function startLiveTracker() {
    if (typeof firebase === 'undefined') { setTimeout(startLiveTracker, 300); return; }
    var firebaseConfig = {
      apiKey: "AIzaSyDC0H-DW3avFnMRmipaI3qSyYLnb2B3CEU",
      authDomain: "rating-revieww.firebaseapp.com",
      databaseURL: "https://rating-revieww-default-rtdb.firebaseio.com",
      projectId: "rating-revieww",
      storageBucket: "rating-revieww.firebasestorage.app",
      messagingSenderId: "936802340652",
      appId: "1:936802340652:web:9283ff8a9ffcbee6686689"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    var db = firebase.database();
    var onlineUsersRef = db.ref('live_website_visitors');
    var counterDisplay = document.getElementById('active-users');
    var countBox = document.querySelector('#member-root .live-count-box');
    if (!counterDisplay || !countBox) return;
    var currentCount = 0;

    db.ref('.info/connected').on('value', function (snap) {
      if (snap.val() === true) {
        var myConnectionRef = onlineUsersRef.push();
        myConnectionRef.onDisconnect().remove();
        myConnectionRef.set({ device: navigator.platform, joinedAt: firebase.database.ServerValue.TIMESTAMP });
      }
    });
    onlineUsersRef.on('value', function (snapshot) {
      var newCount = snapshot.numChildren() || 0;
      if (newCount !== currentCount) {
        counterDisplay.innerText = newCount;
        countBox.classList.remove('pop-anim');
        void countBox.offsetWidth;
        countBox.classList.add('pop-anim');
        currentCount = newCount;
      }
    });
  }

  /* --- হালকা স্নো পার্টিকেল ইফেক্ট, শুধু এই পেজে সক্রিয় থাকা অবস্থায় চলে --- */
  function startSnowEffect() {
    var canvas = document.getElementById('member-snow');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;
    var maxParticles = width < 768 ? 25 : 50;
    var particles = [];

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (isInitial) {
      this.x = Math.random() * width;
      this.y = isInitial ? Math.random() * height : -20;
      this.radius = Math.random() * 2.2 + 1;
      this.speedY = Math.random() * 1.2 + 0.4;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.opacity = Math.random() * 0.5 + 0.3;
    };
    Particle.prototype.update = function () {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y > height || this.x < -20 || this.x > width + 20) this.reset(false);
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(227, 167, 62,' + this.opacity + ')';
      ctx.fill();
    };

    for (var i = 0; i < maxParticles; i++) particles.push(new Particle());

    function onResize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', onResize);

    function animate() {
      var memberRoot = document.getElementById('member-root');
      if (!memberRoot || memberRoot.hidden) return; // রুট ছেড়ে গেলে অ্যানিমেশন বন্ধ
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); }
      requestAnimationFrame(animate);
    }
    animate();
  }

  renderStats();
  renderMembers();
  s.typeTimer = setTimeout(typeEffect, 1000);
  if (!s.rafId) { s.rafId = requestAnimationFrame(autoScrollLoop); }
  startLiveTracker();
  startSnowEffect();
};
