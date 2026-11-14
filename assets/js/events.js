// Store-tap counter (Privacy Policy 10.5). Sends one "visit" note per browser session and one
// "tap" note each time someone taps an App Store or Google Play link: which store, the button's
// data-placement, the page path, and the ad tag (utm_content) / source (utm_source) the visit
// came from. No cookies, no IP or device ID. Goes to ShieldNav's own Cloudflare Worker
// "sn-events" (D1 database "shieldnav-events"); per-ad results feed the weekly Meta review.
(function () {
  var URL_ = 'https://sn-events.young-resonance-17ed.workers.dev/e';
  var ad = '', src = '';
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get('utm_content') || qs.get('utm_source')) {
      sessionStorage.setItem('sn_ad', qs.get('utm_content') || '');
      sessionStorage.setItem('sn_src', qs.get('utm_source') || '');
    }
    ad = sessionStorage.getItem('sn_ad') || '';
    src = sessionStorage.getItem('sn_src') || '';
  } catch (e) {}

  function send(o) {
    o.a = ad; o.src = src; o.pg = location.pathname;
    try {
      fetch(URL_, { method: 'POST', body: JSON.stringify(o), keepalive: true, mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  }

  try {
    if (!sessionStorage.getItem('sn_v')) { sessionStorage.setItem('sn_v', '1'); send({ e: 'visit' }); }
  } catch (e) {}

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[href*="apps.apple.com"], a[href*="play.google.com"]');
    if (!a) return;
    send({ e: 'tap', s: a.href.indexOf('apps.apple.com') > -1 ? 'appstore' : 'googleplay',
      p: a.getAttribute('data-placement') || 'other' });
  }, true);
})();
