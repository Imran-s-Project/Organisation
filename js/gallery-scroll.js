/* গ্যালারি — স্ক্রল করলে "উপরে যান" বাটন দেখানো */
window.RJF = window.RJF || {};

RJF._wireGalleryScrollTop = function () {
  var btn = document.getElementById('galleryScrollTop');

  function onScroll() {
    btn.classList.toggle('show', window.pageYOffset > 300);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};
