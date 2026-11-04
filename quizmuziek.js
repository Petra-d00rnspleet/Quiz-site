// ============================================================================
// quizmuziek.js — het muziekje tijdens een quiz
// Speelt quizmuziek.mp3 vanaf het moment dat de vraag laadt (intro) en zolang
// je je antwoord kunt invullen. Zodra je antwoord binnen is, het resultaat
// verschijnt of de quiz afgelopen is, stopt het. Bij de volgende vraag begint
// het muziekje weer opnieuw. Verandert niets aan de quiz zelf.
// ============================================================================
(function () {
  var MUZIEK_SCHERMEN = [
    'scherm-speler-intro', 'scherm-speler-vraag',   // meedoen met een quiz
    'scherm-solo-intro',   'scherm-solo-vraag',     // alleen spelen
    'scherm-host-intro',   'scherm-host-vraag'      // quizmaster (haal deze twee weg als de host geen muziek wil)
  ];

  var audio = new Audio('quizmuziek.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.7;
  audio.addEventListener('error', function () {
    console.warn('[quizmuziek] Kan quizmuziek.mp3 niet laden. Staat het bestand naast index.html en heet het precies zo?', audio.error);
  });

  // Knopje dat alleen verschijnt als de browser het geluid blokkeert
  var knop = document.createElement('button');
  knop.type = 'button';
  knop.textContent = '🔊 Tik voor muziek';
  knop.hidden = true;
  knop.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9999;' +
    'padding:12px 20px;border-radius:999px;border:1px solid #f0c04d;background:#10152e;color:#f0c04d;' +
    'font:700 16px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.5);cursor:pointer;';
  document.body.appendChild(knop);
  knop.addEventListener('click', function () { speel(); });

  function moetSpelen() {
    var actief = document.querySelector('.scherm.actief');
    return !!actief && MUZIEK_SCHERMEN.indexOf(actief.id) !== -1;
  }

  function speel() {
    var p;
    try { p = audio.play(); } catch (e) {}
    if (p && p.then) {
      p.then(function () { knop.hidden = true; }, function (err) {
        console.warn('[quizmuziek] Afspelen geblokkeerd of mislukt:', err && err.name, err && err.message);
        // Alleen als de browser het blokkeert tonen we het knopje (niet bij een ontbrekend bestand)
        knop.hidden = !(err && err.name === 'NotAllowedError') || !moetSpelen();
      });
    }
  }

  function werkMuziekBij() {
    if (moetSpelen()) {
      if (audio.paused) speel();
    } else {
      knop.hidden = true;
      if (!audio.paused || audio.currentTime > 0) {
        audio.pause();
        audio.currentTime = 0;   // volgende vraag begint weer vooraan
      }
    }
  }

  // Bij de eerste tik/toets even stilletjes "ontgrendelen" (nodig op telefoons)
  function ontgrendel() {
    document.removeEventListener('pointerdown', ontgrendel, true);
    document.removeEventListener('keydown', ontgrendel, true);
    if (moetSpelen()) { speel(); return; }
    audio.muted = true;
    var p;
    try { p = audio.play(); } catch (e) {}
    var klaar = function () {
      audio.pause(); audio.currentTime = 0; audio.muted = false;
      werkMuziekBij();
    };
    if (p && p.then) p.then(klaar, function () { audio.muted = false; });
    else klaar();
  }
  document.addEventListener('pointerdown', ontgrendel, true);
  document.addEventListener('keydown', ontgrendel, true);

  var obs = new MutationObserver(werkMuziekBij);
  document.querySelectorAll('.scherm').forEach(function (el) {
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
  werkMuziekBij();
})();
