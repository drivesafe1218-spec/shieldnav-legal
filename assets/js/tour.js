// Pinned phone tour on the homepage. CSS (home.css) pins the phone with
// position: sticky; this script only decides which step is active:
//  - an IntersectionObserver watches a thin line across the viewport (the
//    middle on desktop, just under the pinned phone on mobile) and the step
//    crossing it becomes active;
//  - the active step's screen crossfades in and its clip plays ONCE (not
//    scrubbed with scroll); leaving a step pauses and rewinds it;
//  - posters load when their step is near; a clip's src is only set when its
//    step is active or next.
// Without JS, or with prefers-reduced-motion, nothing here runs and the page
// stays a plain list: each step keeps its own poster image.
(function () {
  var tour = document.querySelector('[data-tour]');
  if (!tour) return;
  // The step posters carry data-src (with a <noscript> copy for no-JS) so the
  // browser does not fetch all of them up front.
  var imgs = [].slice.call(tour.querySelectorAll('img[data-src]'));
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    imgs.forEach(function (im) { im.loading = 'lazy'; im.src = im.getAttribute('data-src'); });
    return;
  }

  var steps = [].slice.call(tour.querySelectorAll('.tour-step'));
  var screen = tour.querySelector('.tour-screen');
  var nums = [].slice.call(tour.querySelectorAll('.tour-counter span'));
  if (!steps.length || !screen) return;

  // Build the pinned stage: move each step's poster into it, add a clip on top.
  var shots = steps.map(function (step) {
    var shot = document.createElement('div');
    shot.className = 'tour-shot';
    shot.appendChild(step.querySelector('.step-img'));
    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'none';
    v.tabIndex = -1;
    v.addEventListener('playing', function () { shot.classList.add('is-playing'); });
    shot.appendChild(v);
    screen.appendChild(shot);
    return { shot: shot, img: shot.firstChild, video: v, src: step.getAttribute('data-video'), loaded: false, imgLoaded: false };
  });
  tour.classList.add('is-pinned');

  var current = -1;
  function setActive(i, quiet) {
    if (i === current) return;
    var prev = shots[current];
    if (prev) {
      prev.shot.classList.remove('is-active', 'is-playing');
      prev.video.pause();
      try { prev.video.currentTime = 0; } catch (e) {}
      steps[current].classList.remove('is-active');
    }
    current = i;
    var s = shots[i];
    s.shot.classList.add('is-active');
    steps[i].classList.add('is-active');
    nums.forEach(function (n, k) { n.classList.toggle('on', k === i); });
    if (quiet) return;
    loadPoster(i); loadVideo(i); loadPoster(i + 1); loadVideo(i + 1);
    var p = s.video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the poster stays */ });
  }
  function loadPoster(i) {
    var s = shots[i];
    if (!s || s.imgLoaded) return;
    s.imgLoaded = true;
    s.img.src = s.img.getAttribute('data-src');
  }
  function loadVideo(i) {
    var s = shots[i];
    if (!s || s.loaded || !s.src) return;
    s.loaded = true;
    s.video.poster = s.img.getAttribute('data-src');
    s.video.preload = 'auto';
    s.video.src = s.src;
  }

  // Posters load when their step is within half a screen of view.
  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) loadPoster(steps.indexOf(e.target)); });
  }, { rootMargin: '50% 0px 50% 0px' });
  steps.forEach(function (st) { near.observe(st); });

  // Which step is "current": the one crossing a thin line of the viewport.
  var mq = window.matchMedia('(max-width: 820px)');
  var io;
  function watch() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(steps.indexOf(e.target)); });
    }, { rootMargin: mq.matches ? '-62% 0px -37% 0px' : '-50% 0px -49% 0px' });
    steps.forEach(function (st) { io.observe(st); });
  }
  // The counter sits at the far left on desktop; on phones it rides inside the
  // pinned stage so it leaves with it.
  var counter = tour.querySelector('.tour-counter');
  var stage = tour.querySelector('.tour-stage');
  var inner = tour.querySelector('.tour-inner');
  function place() {
    if (!counter) return;
    if (mq.matches) stage.appendChild(counter); else inner.insertBefore(counter, stage);
  }
  place();
  setActive(0, true);
  watch();
  if (mq.addEventListener) mq.addEventListener('change', function () { place(); watch(); });
})();
