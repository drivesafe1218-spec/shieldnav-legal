// Collapses the site nav into a Menu button on narrow screens. Without this
// script the links simply wrap, so the page still works if it fails to load.
(function () {
  var nav = document.querySelector('.site-nav.full');
  var toggle = nav && nav.querySelector('.nav-toggle');
  if (!toggle) return;
  nav.classList.add('js-collapsible');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// Download bar for the marketing pages. On phones (<= 820px) it is a sticky
// bar along the bottom of the screen; on desktop the sticky top nav gets a
// "Download" button. The homepage ships both in its HTML so they exist at first
// paint; every other marketing page gets them from here. No JS: the page's own
// App Store badge is the fallback. Skipped on privacy, terms, legal,
// crime-disclaimer, waitlist and 404. Runs BEFORE the ct=meta-ads rewrite below
// so the injected links get rewritten too.
(function () {
  var APP_URL = 'https://apps.apple.com/app/apple-store/id6809643112?pt=129410605&ct=website&mt=8';
  var path = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  if (!/^\/(product|about|faq|support|contact)?$/.test(path)) return;
  document.body.classList.add('has-dl-bar');

  var nav = document.querySelector('.site-nav.full .nav-links');
  if (nav && !nav.querySelector('.nav-dl')) {
    var dl = document.createElement('a');
    dl.className = 'nav-dl plausible-event-name=App+Store+Click';
    dl.href = APP_URL;
    dl.setAttribute('data-placement', 'nav');
    dl.textContent = 'Download';
    nav.appendChild(dl);
  }

  if (document.querySelector('.dl-bar')) return;
  var bar = document.createElement('div');
  bar.className = 'dl-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Download ShieldNav');
  bar.innerHTML =
    '<img src="/assets/images/apple-touch-icon.png" width="40" height="40" alt="" />' +
    '<p class="dl-bar-text"><strong>ShieldNav</strong><span class="sr-only"> \u2014 </span><span>Free 7-day trial</span></p>' +
    '<a class="dl-bar-btn plausible-event-name=App+Store+Click" data-placement="sticky-bar" href="' + APP_URL + '">Get on the App Store</a>';
  document.body.appendChild(bar);
})();

// Visitors from the Meta ad land with ?utm_source=meta. Tag their App Store
// links ct=meta-ads (instead of ct=website) so App Store Connect can tell the
// two apart. Remembered for the visit so it survives clicking to other pages.
(function () {
  try {
    if (new URLSearchParams(location.search).get('utm_source') === 'meta') {
      sessionStorage.setItem('sn_ct', 'meta-ads');
    }
    if (sessionStorage.getItem('sn_ct') !== 'meta-ads') return;
  } catch (e) { return; }
  document.querySelectorAll('a[href*="apps.apple.com"]').forEach(function (a) {
    a.href = a.href.replace('ct=website', 'ct=meta-ads');
  });
})();
