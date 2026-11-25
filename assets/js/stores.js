// Device-aware store buttons. Android: Google Play first in every badge row, and the mobile sticky
// bar points to Google Play. iOS and everything else: markup is left exactly as served.
(function () {
  var ua = navigator.userAgent || '';
  if (!/Android/i.test(ua)) return;
  try {
    var rows = document.querySelectorAll('.store-badges');
    var play = null;
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i].querySelector('.play-badge');
      if (p) { rows[i].insertBefore(p, rows[i].firstChild); if (!play) play = p; }
    }
    if (!play) play = document.querySelector('a.play-badge');
    var btn = document.querySelector('.dl-bar-btn');
    if (btn && play) {
      btn.setAttribute('href', play.getAttribute('href'));
      btn.textContent = 'Get it on Google Play';
      btn.className = btn.className.replace('App+Store+Click', 'Google+Play+Click');
    }
  } catch (e) {}
})();
