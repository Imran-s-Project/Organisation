/* টপ ন্যাভিগেশন বার — লোগো, মেনু লিংক, স্ক্রল ও মোবাইল টগল */
window.RJF = window.RJF || {};

RJF.renderNav = function(){
  var root = document.getElementById('nav-root');
  if(!root) return;
  var d = RJF.data;

  var linksHtml = d.nav.map(function(item){
    return '<a href="' + item.href + '" data-close>' + item.label + '</a>';
  }).join('');

  root.innerHTML =
    '<nav class="nav" id="mainNav">' +
      '<div class="brand" id="brandLogoWrap"></div>' +
      '<div class="nav-links" id="navLinks">' + linksHtml + '</div>' +
      '<button class="nav-toggle" id="navToggle" aria-label="মেনু খুলুন"><span></span><span></span><span></span></button>' +
    '</nav>';

  /* banner logo, image missing হলে আগের টেক্সট-লোগোতে ফিরে যাবে */
  var brandWrap = document.getElementById('brandLogoWrap');
  var img = document.createElement('img');
  img.className = 'brand-logo';
  img.src = d.brand.logo;
  img.alt = d.brand.name;
  img.addEventListener('error', function(){
    brandWrap.innerHTML =
      '<div class="brand-mark">' + d.brand.name.charAt(0) + '</div>' +
      '<div><div class="logo-text">' + d.brand.name + '</div><div class="logo-sub">' + d.brand.sub + '</div></div>';
  });
  brandWrap.appendChild(img);

  var nav = document.getElementById('mainNav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu(){
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  }
  function toggleMenu(){
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  }

  navToggle.addEventListener('click', function(e){
    e.stopPropagation();
    toggleMenu();
  });
  navLinks.querySelectorAll('[data-close]').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });

  /* নেভিগেশন বারের বাইরে ক্লিক করলে মেনু বন্ধ হয়ে যাবে */
  document.addEventListener('click', function(e){
    if(!navLinks.classList.contains('open')) return;
    if(navLinks.contains(e.target) || navToggle.contains(e.target)) return;
    closeMenu();
  });

  /* Esc চাপলেও মেনু বন্ধ হবে */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });
};
