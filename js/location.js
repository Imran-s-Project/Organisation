/* অবস্থান সেকশন — ঠিকানা, ফোন, ইমেইল ও ম্যাপ */
window.RJF = window.RJF || {};

RJF.renderLocation = function(){
  var root = document.getElementById('location-root');
  if(!root) return;
  var l = RJF.data.location;

  root.innerHTML =
    '<section class="location" id="অবস্থান">' +
      '<div class="section-head">' +
        '<div class="eyebrow">আমাদের অবস্থান</div>' +
        '<h2>' + l.heading + '</h2>' +
        '<p>' + l.sub + '</p>' +
      '</div>' +
      '<div class="loc-grid">' +
        '<div class="loc-card">' +
          '<div class="loc-row">' + RJF.iconSvg('pin') + '<div><h4>ঠিকানা</h4><span>' + l.address + '</span></div></div>' +
          '<div class="loc-row"><a href="tel:' + l.phone + '" class="loc-link">' + RJF.iconSvg('phone') + '<div><h4>ফোন</h4><span>' + l.phone + '</span></div></a></div>' +
          '<div class="loc-row"><a href="mailto:' + l.email + '?subject=' + encodeURIComponent('যোগাযোগ - ' + RJF.data.brand.name) + '&body=' + encodeURIComponent('আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু,\n\nসম্মানিত কর্তৃপক্ষ,\n\nবিনীত নিবেদন এই যে, আমি আপনাদের সাথে নিম্নলিখিত বিষয়ে যোগাযোগ করতে ইচ্ছুক।\n\nবিষয়: \n\nবিস্তারিত:\n\n\nআপনাদের মূল্যবান সময় ও সহযোগিতার জন্য আন্তরিক ধন্যবাদ। বিষয়টি সদয় বিবেচনা করে উত্তর দিলে কৃতজ্ঞ থাকব।\n\nবিনীত,\nনাম: \nমোবাইল: \nইমেইল: \n') + '" class="loc-link">' + RJF.iconSvg('mail') + '<div><h4>ইমেইল</h4><span>' + l.email + '</span></div></a></div>' +
        '</div>' +
        '<div class="map-wrap"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + l.mapEmbed + '"></iframe></div>' +
      '</div>' +
    '</section>';
};
