// Store-tap counter (Privacy Policy 10.5). Sends one "visit" note per browser session and one
// "tap" note each time someone taps an App Store or Google Play link: which store, the button's
// data-placement, the page path, and the ad tag (utm_content) / source (utm_source) the visit
// came from. No cookies, no IP or device ID. Goes to ShieldNav's own Cloudflare Worker
// "sn-events" (D1 database "shieldnav-events"); per-ad results feed the weekly Meta review.
// Since 2026-11-25 visits are counted only after a real interaction (first trusted touch, click,
// keypress, or a scroll of 50px or more, or right before a tap); raw page loads are in Cloudflare
// Web Analytics. Automated browsers (navigator.webdriver) send nothing, and synthetic or
// duplicate taps (untrusted clicks, repeats within 1.5 seconds) are dropped.
// Also since 2026-11-25: one "load" note per session when a page opens (to compare with engaged
// visits per ad), and, after the engaged visit, how far down the page someone scrolled
// ("scroll" with p = 25/50/75/100 %) and how long the page stayed visible ("time" with
// p = 10/30/60 seconds). Each threshold is sent at most once per page view.
(function () {
  var URL_ = 'https://sn-events.young-resonance-17ed.workers.dev/e';
  var ad = '', src = '';
  try {
    var qs = new URLSearchParams(location.search);
    // A paid click on an ad built from an existing Facebook post carries two sets of tags: the
    // post's own organic ones (e.g. utm_source=facebook, utm_content=post-ad-011) and the ad's,
    // which Meta adds from the ad's URL parameters (utm_source=meta, utm_content=ad-011). When an
    // ad-### tag is present it wins, so paid and organic visits are counted apart.
    var cs = qs.getAll('utm_content'), ss = qs.getAll('utm_source'), c = '', s = '';
    for (var i = cs.length - 1; i >= 0; i--) { if (/^ad-\d+$/.test(cs[i])) { c = cs[i]; break; } }
    if (!c) c = cs[0] || '';
    s = (/^ad-\d+$/.test(c) && ss.indexOf('meta') > -1) ? 'meta' : (ss[0] || '');
    if (c || s) {
      sessionStorage.setItem('sn_ad', c);
      sessionStorage.setItem('sn_src', s);
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

  // Automated browsers (ad-review bots, crawlers that run JS) send nothing at all.
  if (navigator.webdriver === true) return;

  // One engaged "visit" per browser session, sent on the first real interaction.
  var visited = false;
  try { visited = !!sessionStorage.getItem('sn_v'); } catch (e) {}
  var evs = ['touchstart', 'pointerdown', 'keydown', 'scroll'];
  function visit() {
    if (visited) return;
    visited = true;
    try { sessionStorage.setItem('sn_v', '1'); } catch (e) {}
    for (var i = 0; i < evs.length; i++) window.removeEventListener(evs[i], onFirst, { passive: true });
    send({ e: 'visit' });
  }
  function onFirst(ev) {
    if (!ev.isTrusted) return;
    if (ev.type === 'scroll' && (window.pageYOffset || document.documentElement.scrollTop || 0) < 50) return;
    visit();
  }
  if (!visited) {
    for (var k = 0; k < evs.length; k++) window.addEventListener(evs[k], onFirst, { passive: true });
  }

  // Raw page open, once per browser session (bots that run JS included; compare with "visit").
  try {
    if (!sessionStorage.getItem('sn_l')) { sessionStorage.setItem('sn_l', '1'); send({ e: 'load' }); }
  } catch (e) {}

  // Scroll depth: 25/50/75/100 % of the page, each once per page view, only after the engaged visit.
  var depths = [25, 50, 75, 100], sentDepth = {};
  function onDepth() {
    if (!visited) return;
    var el = document.documentElement;
    var h = Math.max(el.scrollHeight, document.body ? document.body.scrollHeight : 0);
    var seen = (window.pageYOffset || el.scrollTop || 0) + window.innerHeight;
    var pct = h > 0 ? (seen / h) * 100 : 100;
    for (var i = 0; i < depths.length; i++) {
      var d = depths[i];
      if (!sentDepth[d] && pct >= (d === 100 ? 98 : d)) { sentDepth[d] = true; send({ e: 'scroll', p: String(d) }); }
    }
    if (sentDepth[100]) window.removeEventListener('scroll', onDepth, { passive: true });
  }
  window.addEventListener('scroll', onDepth, { passive: true });

  // Time on page: seconds the page was visible, notes at 10/30/60 s, only after the engaged visit.
  var marks = [10, 30, 60], mi = 0, secs = 0;
  var timer = setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    secs++;
    if (visited && mi < marks.length && secs >= marks[mi]) { send({ e: 'time', p: String(marks[mi]) }); mi++; }
    if (mi >= marks.length) clearInterval(timer);
  }, 1000);

  var lastTap = 0;
  document.addEventListener('click', function (ev) {
    if (!ev.isTrusted) return;
    var a = ev.target && ev.target.closest && ev.target.closest('a[href*="apps.apple.com"], a[href*="play.google.com"]');
    if (!a) return;
    var now = Date.now();
    if (lastTap && now - lastTap < 1500) return;
    lastTap = now;
    visit();
    send({ e: 'tap', s: a.href.indexOf('apps.apple.com') > -1 ? 'appstore' : 'googleplay',
      p: a.getAttribute('data-placement') || 'other' });
  }, true);
})();
