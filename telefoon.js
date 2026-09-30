// ============================================================================
// telefoon.js — hulpjes voor de telefoon-indeling (zie telefoon.css).
// Doet niets op de laptop. Verandert geen gegevens: de onderbalk klikt gewoon
// op de bestaande knoppen (Vrienden, Profiel) en gaat naar het startscherm.
// ============================================================================
(function () {
  var html = document.documentElement;
  var mq = window.matchMedia('(max-width: 700px), (pointer: coarse) and (max-width: 900px)');

  // 1. Weet welk scherm actief is (voor het tonen van de onderbalk)
  function werkSchermBij() {
    var actief = document.querySelector('.scherm.actief');
    document.body.setAttribute('data-scherm', actief ? actief.id : '');
  }
  var schermObs = new MutationObserver(werkSchermBij);
  document.querySelectorAll('.scherm').forEach(function (el) {
    schermObs.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
  werkSchermBij();

  // 2. Emoji boven de tekst in de tegels op het startscherm
  function splitsTegels() {
    if (!html.classList.contains('telefoon')) return;
    document.querySelectorAll('.vak').forEach(function (vak) {
      if (vak.getAttribute('data-gesplitst')) return;
      var t = vak.firstChild;
      if (!t || t.nodeType !== 3) return;
      var m = t.nodeValue.match(/^\s*(\S+)\s+([\s\S]*)$/);
      if (!m) return;
      var e = document.createElement('span');
      e.className = 'vak-emoji';
      e.setAttribute('aria-hidden', 'true');
      e.textContent = m[1];
      t.nodeValue = m[2];
      vak.insertBefore(e, t);
      vak.setAttribute('data-gesplitst', '1');
    });
  }
  splitsTegels();
  if (mq.addEventListener) mq.addEventListener('change', splitsTegels); else if (mq.addListener) mq.addListener(splitsTegels);

  // 3. Onderbalk: knoppen en cijfertje/poppetje overnemen van de bovenbalk
  var nav = document.getElementById('telefoon-nav');
  if (!nav) return;
  nav.addEventListener('click', function (e) {
    var knop = e.target.closest('button[data-nav]');
    if (!knop) return;
    var soort = knop.getAttribute('data-nav');
    if (soort === 'start') {
      if (typeof toonScherm === 'function') toonScherm('scherm-algemeen');
      window.scrollTo(0, 0);
    } else if (soort === 'vrienden') {
      var v = document.getElementById('btn-vrienden-badge'); if (v) v.click();
    } else if (soort === 'profiel') {
      var p = document.getElementById('btn-profiel-badge'); if (p) p.click();
    }
  });

  var bronAantal = document.getElementById('vrienden-badge-aantal');
  var navAantal = document.getElementById('nav-vrienden-aantal');
  function spiegelAantal() {
    if (!bronAantal || !navAantal) return;
    navAantal.textContent = bronAantal.textContent;
    navAantal.hidden = bronAantal.hidden;
  }
  if (bronAantal) {
    new MutationObserver(spiegelAantal).observe(bronAantal, { childList: true, characterData: true, subtree: true, attributes: true });
    spiegelAantal();
  }

  var bronPop = document.getElementById('profiel-badge-poppetje');
  var navPop = document.getElementById('nav-profiel-poppetje');
  function spiegelPoppetje() {
    if (!bronPop || !navPop) return;
    navPop.innerHTML = bronPop.innerHTML.trim() ? bronPop.innerHTML : '👤';
  }
  if (bronPop) {
    new MutationObserver(spiegelPoppetje).observe(bronPop, { childList: true, characterData: true, subtree: true });
    spiegelPoppetje();
  }
})();
