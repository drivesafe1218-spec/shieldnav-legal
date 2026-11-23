/* Ad message match (homepage only).
 * Each Meta or NewsBreak ad's destination URL carries utm_content=ad-00N (IDs come from the
 * brain sheet's Ad Registry tab). When it matches an entry below, the hero
 * headline and sub text are swapped to mirror the ad. Unknown or missing values
 * leave the default hero untouched. New ads get new entries in COPY.
 */
(function () {
  try {
    var COPY = {
      'ad-001': {
        h1: 'Don’t skip the night out.',
        sub: 'See the crime reported along each route home, then pick the Safest route and go.'
      },
      'ad-002': {
        h1: 'See what crime is reported en route.',
        sub: 'Full turn-by-turn navigation, plus three routes and the crime reported along each one.'
      },
      'ad-003': {
        h1: 'See the crime reported on your route.',
        sub: 'Each incident from police reports: what happened, when, and how close it was to your route.'
      },
      'ad-004': {
        h1: 'Check the drop-off before you arrive.',
        sub: 'Parking Safety checks the crime reported around your drop-off, so you know before you go.'
      },
      'ad-005': {
        h1: 'A full nav app that shows more.',
        sub: 'Voice directions, rerouting and speed limits, plus the crime reported along every route option.'
      },
      'ad-006': {
        h1: 'Don’t be Clyde. Check your parking spot.',
        sub: 'ShieldNav checks reported crime around your drop-off before you arrive.'
      },
      'ad-007': {
        h1: 'Safest route. No guessing.',
        sub: 'Heading home after a long day, and every block looks unfamiliar?'
      },
      'ad-008': {
        h1: 'Where is this thing taking me?',
        sub: 'Heading home after a long day, and every block looks unfamiliar?'
      },
      'ad-009': {
        h1: 'Some problems you can navigate.',
        sub: 'Your drive home is one of them. See the crime reported along your route before you leave.'
      },
      'ad-010': {
        h1: 'Is the crime data real?',
        sub: 'ShieldNav uses police reports. Tap any incident on your route to see what was reported, when, and how close it was.'
      },
      'ad-011': {
        h1: 'How to read your three routes.',
        sub: 'Safest, Fastest or an Alternative, each with the crime incidents recently reported along it, plus Parking Safety for your drop-off.'
      },
      'ad-012': {
        h1: 'Your map app is free. Why pay for another one?',
        sub: 'ShieldNav is full turn-by-turn navigation, plus the crime reported along each route option.'
      },
      'ad-013': {
        h1: 'Don’t read this if fastest is all you need.',
        sub: 'Most nav apps show you the fastest route and stop there. ShieldNav also shows the crime reported along each route.'
      },
      'ad-014': {
        h1: 'Same drive home. Pick a line.',
        sub: 'Each line is a route. See the crime reported along each one before you pick.'
      },
      'ad-015': {
        h1: 'Heading out tonight?',
        sub: 'You’ve planned the route. Parking Safety checks reported incidents around your drop-off before you arrive.'
      },
      'ad-016': {
        h1: 'Check your parking spot before you arrive.',
        sub: 'Before you park, check the crime reported around your spot. Know before you go.'
      },
      // NewsBreak ads (utm_source=newsbreak); same heroes as the Meta ads they came from.
      'ad-027': {
        h1: 'Where is this thing taking me?',
        sub: 'Heading home after a long day, and every block looks unfamiliar?'
      },
      'ad-028': {
        h1: 'Some problems you can navigate.',
        sub: 'Your drive home is one of them. See the crime reported along your route before you leave.'
      }
    };
    // Paid clicks on ads built from existing posts carry the post's organic tag and the ad's
    // ad-### tag; use the ad-### one when present (same rule as events.js).
    var ids = new URLSearchParams(window.location.search).getAll('utm_content'), id = '';
    for (var i = ids.length - 1; i >= 0; i--) { if (/^ad-\d+$/.test(ids[i])) { id = ids[i]; break; } }
    if (!id || !Object.prototype.hasOwnProperty.call(COPY, id)) return;
    var h1 = document.getElementById('hero-title');
    var sub = document.getElementById('hero-sub');
    if (!h1 || !sub) return;
    h1.textContent = COPY[id].h1;
    sub.textContent = COPY[id].sub;
  } catch (e) { /* leave default hero */ }
})();
