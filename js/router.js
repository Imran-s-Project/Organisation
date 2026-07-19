/* ছোট্ট রাউটার — একটাই index.html ফাইল দিয়ে হোম ও লিগ্যাল পেজ (প্রাইভেসি/টার্মস) সুইচ করে,
   আলাদা .html ফাইলের দরকার নেই। URL: #/privacy, #/terms — বাকি সব হ্যাশ (#hero ইত্যাদি) স্ক্রল-অ্যাঙ্কর হিসেবে কাজ করে। */
window.RJF = window.RJF || {};

RJF.HOME_ROOTS = ['hero-root', 'intro-root', 'about-root', 'location-root'];
RJF.LEGAL_PAGES = ['privacy', 'terms'];

RJF.renderHome = function () {
  RJF.renderHero();
  RJF.renderIntro();
  RJF.renderAbout();
  RJF.renderLocation();
};

RJF.route = function () {
  var hash = window.location.hash;
  var legalKey = hash === '#/privacy' ? 'privacy' : hash === '#/terms' ? 'terms' : null;
  var isDonate = hash === '#/donate';
  var isMember = hash === '#/member';
  var legalRoot = document.getElementById('legal-root');
  var donateRoot = document.getElementById('donate-root');
  var memberRoot = document.getElementById('member-root');

  if (legalKey || isDonate || isMember) {
    RJF.HOME_ROOTS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });

    if (legalRoot) legalRoot.hidden = !legalKey;
    if (donateRoot) donateRoot.hidden = !isDonate;
    if (memberRoot) memberRoot.hidden = !isMember;

    if (legalKey) RJF.renderLegalPage(legalKey);
    if (isDonate) RJF.renderDonatePage();
    if (isMember) RJF.renderMemberPage();

    window.scrollTo(0, 0);
    return;
  }

  RJF.HOME_ROOTS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.hidden = false;
  });
  if (legalRoot) legalRoot.hidden = true;
  if (donateRoot) donateRoot.hidden = true;
  if (memberRoot) memberRoot.hidden = true;

  if (hash.length > 1 && hash.indexOf('#/') !== 0) {
    var target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }
};
