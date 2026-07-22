/* গ্যালারি — "গ্যালারি / ভিডিও" টগল সুইচার ও লাইভ কাউন্টার */
window.RJF = window.RJF || {};

RJF._wireGallerySwitcher = function () {
  var toggleBtns = document.querySelectorAll('.gallery-toggle-btn');
  var slider = document.getElementById('galleryToggleSlider');
  var photosSection = document.getElementById('galleryPhotosSection');
  var videosSection = document.getElementById('galleryVideosSection');

  var photoCount = document.querySelectorAll('#galleryGrid .gallery-item').length;
  var videoCount = document.querySelectorAll('.gallery-video-block').length;
  document.getElementById('galleryPhotoCount').textContent = photoCount;
  document.getElementById('galleryVideoCount').textContent = videoCount;

  function moveSlider(btn) {
    slider.style.width = btn.offsetWidth + 'px';
    slider.style.left = btn.offsetLeft + 'px';
  }
  moveSlider(toggleBtns[0]);

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      moveSlider(btn);

      var showPhotos = btn.dataset.target === 'photos';
      photosSection.classList.toggle('gallery-hidden', !showPhotos);
      videosSection.classList.toggle('gallery-hidden', showPhotos);
    });
  });

  window.addEventListener('resize', function () {
    var active = document.querySelector('.gallery-toggle-btn.active');
    if (active) moveSlider(active);
  });
};
