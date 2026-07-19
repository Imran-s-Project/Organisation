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
          '<div class="loc-row">' + RJF.iconSvg('phone') + '<div><h4>ফোন</h4><span>' + l.phone + '</span></div></div>' +
          '<div class="loc-row">' + RJF.iconSvg('mail') + '<div><h4>ইমেইল</h4><span>' + l.email + '</span></div></div>' +
        '</div>' +
        '<div class="map-wrap"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + l.mapEmbed + '"></iframe></div>' +
      '</div>' +
    '</section>';
};
