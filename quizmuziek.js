// ============================================================================
// quizmuziek.js — het muziekje tijdens een quiz
// Speelt quizmuziek.mp3 vanaf het moment dat de vraag laadt (intro) en zolang
// je je antwoord kunt invullen. Zodra je antwoord binnen is, het resultaat
// verschijnt of de quiz afgelopen is, stopt het. Bij de volgende vraag begint
// het muziekje weer opnieuw. Verandert niets aan de quiz zelf.
// ============================================================================
(function () {
  // Op deze schermen speelt de muziek (laden + antwoord invullen)
  var MUZIEK_SCHERMEN = [
    'scherm-solo-intro',   'scherm-solo-vraag',     // alleen spelen
    'scherm-host-intro',   'scherm-host-vraag'      // quizmaster (haal deze twee weg als de host geen muziek wil)
  ];

  var audio = new Audio('quizmuziek.mp3?v=1');
  audio.loop = true;          // is de vraag langer dan het muziekje, dan begint het opnieuw
  audio.preload = 'auto';
  audio.volume = 0.7;

  // Telefoons (vooral iPhones) laten geluid pas toe nadat je één keer hebt getikt.
  // Bij de eerste tik "ontgrendelen" we het geluid stilletjes.
  var ontgrendeld = false;
  function ontgrendel() {
    if (ontgrendeld) return;
    ontgrendeld = true;
    document.removeEventListener('pointerdown', ontgrendel, true);
    document.removeEventListener('keydown', ontgrendel, true);
    var p;
    try {
      audio.muted = true;
      p = audio.play();
    } catch (e) {}
    var klaar = function () {
      audio.pause(); audio.currentTime = 0; audio.muted = false;
      werkMuziekBij();   // staat er nu al een vraag? Dan meteen beginnen.
    };
    if (p && p.then) p.then(klaar, function () { audio.muted = false; ontgrendeld = false; addListeners(); });
    else klaar();
  }
  function addListeners() {
    document.addEventListener('pointerdown', ontgrendel, true);
    document.addEventListener('keydown', ontgrendel, true);
  }
  addListeners();

  function moetSpelen() {
    var actief = document.querySelector('.scherm.actief');
    return !!actief && MUZIEK_SCHERMEN.indexOf(actief.id) !== -1;
  }

  function werkMuziekBij() {
    if (moetSpelen()) {
      if (audio.paused && ontgrendeld) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      }
    } else if (!audio.paused || audio.currentTime > 0) {
      audio.pause();
      audio.currentTime = 0;   // volgende vraag begint weer vooraan
    }
  }

  // Kijk mee welk scherm actief is (zelfde manier als telefoon.js)
  var obs = new MutationObserver(werkMuziekBij);
  document.querySelectorAll('.scherm').forEach(function (el) {
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
  werkMuziekBij();
})();
