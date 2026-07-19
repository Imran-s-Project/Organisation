/* পরিচিতি (ইন্ট্রো) ও সম্পর্কে (মিশন/ভিশন + কার্যক্রম) সেকশন রেন্ডার */
window.RJF = window.RJF || {};

RJF.renderIntro = function(){
  var root = document.getElementById('intro-root');
  if(!root) return;
  var i = RJF.data.intro;

  var statsHtml = i.stats.map(function(s){
    return '<div class="stat"><b>' + s.value + '</b><span>' + s.label + '</span></div>';
  }).join('');

  root.innerHTML =
    '<section class="intro" id="porichiti">' +
      '<div class="intro-grid">' +
        '<div>' +
          '<div class="eyebrow">ফাউন্ডেশন পরিচিতি</div>' +
          '<h2>' + i.heading + '</h2>' +
          '<p style="margin-top:16px;color:#41504A;">' + i.body + '</p>' +
          '<div class="stat-row">' + statsHtml + '</div>' +
        '</div>' +
        '<div class="intro-card"><p><strong>' + i.cardTitle + '</strong> ' + i.cardBody + '</p></div>' +
      '</div>' +
    '</section>';
};

RJF.renderAbout = function(){
  var root = document.getElementById('about-root');
  if(!root) return;
  var a = RJF.data.about;

  var activitiesHtml = a.activities.map(function(item){
    return (
      '<div class="activity">' +
        '<div class="activity-icon">' + RJF.iconSvg(item.icon, 'fill="none" stroke="#fff" stroke-width="1.8"') + '</div>' +
        '<h4>' + item.title + '</h4>' +
        '<p>' + item.body + '</p>' +
      '</div>'
    );
  }).join('');

  root.innerHTML =
    '<section class="about" id="somporke">' +
      '<div class="section-head">' +
        '<div class="eyebrow">ফাউন্ডেশন সম্পর্কে</div>' +
        '<h2>' + a.heading + '</h2>' +
        '<p>' + a.sub + '</p>' +
      '</div>' +
      '<div class="mv-grid">' +
        '<div class="mv-card">' + RJF.iconSvg('target','fill="none" stroke="currentColor" stroke-width="1.8"') + '<h3>' + a.mission.title + '</h3><p>' + a.mission.body + '</p></div>' +
        '<div class="mv-card alt">' + RJF.iconSvg('eye','fill="none" stroke="currentColor" stroke-width="1.8"') + '<h3>' + a.vision.title + '</h3><p>' + a.vision.body + '</p></div>' +
      '</div>' +
      '<div class="activities">' + activitiesHtml + '</div>' +
    '</section>';
};
