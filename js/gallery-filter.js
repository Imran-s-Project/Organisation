/* গ্যালারি — বছর ও ক্যাটাগরি ফিল্টার */
window.RJF = window.RJF || {};

RJF._wireGalleryFilters = function () {
  var yearBtns = document.querySelectorAll('#galleryYearFilter [data-year]');
  var categoryBtns = document.querySelectorAll('#galleryCategoryFilter [data-filter]');
  var items = document.querySelectorAll('#galleryGrid .gallery-item, #galleryGrid .gallery-coming-soon');

  var currentYear = 'all';
  var currentCategory = 'all';

  function applyFilter() {
    items.forEach(function (item) {
      var matchesYear = currentYear === 'all' || item.classList.contains('year-' + currentYear);
      var matchesCategory = currentCategory === 'all' ||
        (item.classList.contains('gallery-item') && item.classList.contains(currentCategory));

      /* নির্দিষ্ট ক্যাটাগরি বাছাই করলে কামিং-সুন বক্স আর দেখানো হবে না */
      if (item.classList.contains('gallery-coming-soon') && currentCategory !== 'all') {
        matchesCategory = false;
      }

      item.classList.toggle('gallery-hide', !(matchesYear && matchesCategory));
    });
  }

  yearBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      yearBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentYear = btn.dataset.year;
      applyFilter();
    });
  });

  categoryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      categoryBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentCategory = btn.dataset.filter;
      applyFilter();
    });
  });
};
