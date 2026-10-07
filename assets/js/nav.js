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
