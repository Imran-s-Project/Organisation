/* আমাদের দাতা সদস্যবৃন্দ পেজ — index.html-এ এই ফাইলের প্রভাব নেই, #/donors রুটে render হয়
   (আপলোড করা standalone donor HTML থেকে সাইটের ডোনেট/সদস্য পেজের প্যাটার্নে রূপান্তরিত) */
window.RJF = window.RJF || {};

RJF._donorRankMeta = {
  gold: { icon: "fa-crown", cls: "rank-gold" },
  silver: { icon: "fa-medal", cls: "rank-silver" },
  heart: { icon: "fa-heart", cls: "rank-heart" }
};

RJF._donorCardHtml = function (donor) {
  var meta = RJF._donorRankMeta[donor.rank] || RJF._donorRankMeta.heart;
  return (
    '<div class="donor-card">' +
      '<i class="fa-solid ' + meta.icon + ' rank-badge ' + meta.cls + '"></i>' +
      '<div class="img-container">' +
        '<img class="donor-img" src="' + donor.image + '" alt="' + donor.name + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/150\'">' +
      '</div>' +
      '<span class="donor-title">' + donor.title + '</span>' +
      '<div class="donor-name">' + donor.name + '</div>' +
      '<div class="contribution-info">' +
        '<div><span>সদস্যকাল:</span><strong>' + donor.since + '</strong></div>' +
        '<div><span>অবদান:</span><strong>' + donor.contribution + '</strong></div>' +
      '</div>' +
    '</div>'
  );
};

RJF.renderDonorsPage = function () {
  var root = document.getElementById('donors-root');
  if (!root) return;

  var cardsHtml = RJF.donorList.map(RJF._donorCardHtml).join('');

  root.innerHTML =
    '<div class="donors-page">' +

      '<a class="rjf-back-home" href="#/">' + RJF.iconSvg('up', 'fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(-90deg)"') + '<span>Go back</span></a>' +

      '<header class="donors-header">' +
        '<span class="eyebrow">RJ FOUNDATION</span>' +
        '<h1>আমাদের গর্বিত দাতা সদস্যবৃন্দ</h1>' +
        '<p>আপনাদের বদান্যতায় আমরা গড়ি এক মানবিক পৃথিবী। আপনাদের প্রতিটি দান আমাদের অনুপ্রেরণা।</p>' +
      '</header>' +

      '<div class="donors-container">' +
        '<div class="donor-grid">' + cardsHtml + '</div>' +

        '<div class="join-donor">' +
          '<h2>আমাদের মানবিক যাত্রার অংশীদার হোন</h2>' +
          '<p>আপনার সামান্য সাহায্য একটি দুস্থ পরিবারের মুখে হাসি ফোটাতে পারে। আজই দান করুন।</p>' +
          '<a href="#/donate" class="join-btn">নিয়মিত দাতা হিসেবে যোগ দিন <i class="fa-solid fa-arrow-right"></i></a>' +
        '</div>' +
      '</div>' +

    '</div>';

  RJF._wireDonorsPage();
};

RJF._wireDonorsPage = function () {
  var cards = document.querySelectorAll('#donors-root .donor-card');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  cards.forEach(function (card) { observer.observe(card); });
};
