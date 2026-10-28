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
