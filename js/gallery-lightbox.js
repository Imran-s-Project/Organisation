/* গ্যালারি — ছবিতে ক্লিক করলে বড় করে দেখানোর লাইটবক্স */
window.RJF = window.RJF || {};

RJF._wireGalleryLightbox = function () {
  var lightbox = document.getElementById('galleryLightbox');
  var lightboxImg = document.getElementById('galleryLightboxImg');
  var closeBtn = document.getElementById('galleryLightboxClose');
  var items = document.querySelectorAll('#galleryGrid .gallery-item');

  function open(imgEl) {
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  items.forEach(function (item) {
    var img = item.querySelector('img');
    item.addEventListener('click', function () { open(img); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
  });
};
