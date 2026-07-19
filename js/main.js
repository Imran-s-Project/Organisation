/* সবকিছু একত্রে চালু করার প্রধান ফাইল — একটাই index.html, বাকি সব রাউটার দিয়ে সুইচ হয় */
document.addEventListener('DOMContentLoaded', function () {
  RJF.renderNav();
  RJF.renderHome();
  RJF.renderFooter();
  RJF.renderFeedback();

  RJF.route();
  window.addEventListener('hashchange', RJF.route);
});
