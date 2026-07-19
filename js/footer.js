/* ফুটার — কুইক লিংক, লিগ্যাল লিংক (প্রাইভেসি পলিসি ইত্যাদি), সোশ্যাল ও ব্যাক-টু-টপ বাটন */
window.RJF = window.RJF || {};

RJF.renderFooter = function(){
  var root = document.getElementById('footer-root');
  if(!root) return;
  var d = RJF.data;
  var f = d.footer;

  function linkList(items){
    return '<ul class="footer-links">' + items.map(function(i){
      return '<li><a href="' + i.href + '">' + i.label + '</a></li>';
    }).join('') + '</ul>';
  }

  var socialHtml = f.social.map(function(s){
    return '<a href="' + s.href + '" aria-label="' + s.label + '" target="_blank" rel="noopener">' + RJF.iconSvg(s.icon, 'fill="currentColor"') + '</a>';
  }).join('');

  root.innerHTML =
    '<footer class="site-footer">' +
      '<div class="footer-top">' +
        '<div class="footer-col brand-col">' +
          '<img class="brand-logo-footer" id="footerLogo" alt="' + d.brand.name + '">' +
          '<p>' + f.about + '</p>' +
          '<div class="footer-social">' + socialHtml + '</div>' +
        '</div>' +
        '<div class="footer-col" data-accordion>' +
          '<h4>কুইক লিংক <span class="footer-accordion-toggle">+</span></h4>' + linkList(f.quickLinks) +
        '</div>' +
        '<div class="footer-col" data-accordion>' +
          '<h4>নীতিমালা <span class="footer-accordion-toggle">+</span></h4>' + linkList(f.legalLinks) +
        '</div>' +
        '<div class="footer-col" data-accordion>' +
          '<h4>যোগাযোগ <span class="footer-accordion-toggle">+</span></h4>' +
          '<ul class="footer-links"><li>' + d.location.phone + '</li><li>' + d.location.email + '</li><li>' + d.location.address + '</li></ul>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>&copy; <span id="year"></span> <b>' + d.brand.name + '</b>। সর্বস্বত্ব সংরক্ষিত।</span>' +
      '</div>' +
    '</footer>' +
    '<button class="back-to-top" id="backToTop" aria-label="উপরে যান">' + RJF.iconSvg('up') + '</button>';

  document.getElementById('year').textContent = new Date().getFullYear();

  var footerLogo = document.getElementById('footerLogo');
  footerLogo.src = d.brand.logo;
  footerLogo.addEventListener('error', function(){ footerLogo.style.display = 'none'; });

  /* মোবাইলে ফুটার কলাম অ্যাকর্ডিয়নের মতো খোলা/বন্ধ */
  root.querySelectorAll('[data-accordion] h4').forEach(function(h4){
    h4.addEventListener('click', function(){
      if(window.innerWidth > 640) return;
      h4.parentElement.classList.toggle('open');
    });
  });

  /* ব্যাক-টু-টপ স্মার্ট বাটন — স্ক্রল করলে দেখা যায়, ক্লিকে স্মুথ স্ক্রল */
  var backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', function(){
    backBtn.classList.toggle('show', window.scrollY > 500);
  });
  backBtn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};
