// ============================================================================
// quizqr.js — QR-code voor meedoen aan een quiz
//  1. Quizmaster: in de wachtkamer verschijnt onder de code een QR-code (en een
//     link om te kopiëren). Leerlingen scannen hem met de camera van hun telefoon.
//  2. Speler: opent de site met ?code=ABC123 in het adres, dan gaat hij meteen
//     naar "Meedoen aan quiz" met de code al ingevuld. Alleen de naam nog invullen.
// Verandert niets aan de rest van de site.
// ============================================================================
(function () {
  // ---------- 2. Speler: code uit de link halen ----------
  function leesCodeUitLink() {
    var code = '';
    try { code = (new URLSearchParams(location.search).get('code') || '').trim().toUpperCase(); } catch (e) {}
    return /^[A-Z0-9]{3,10}$/.test(code) ? code : '';
  }
  function openMeedoenMetCode(code) {
    var invoer = document.getElementById('input-code');
    var scherm = document.getElementById('scherm-meedoen');
    if (!invoer || !scherm) return;
    invoer.value = code;
    if (typeof toonScherm === 'function') toonScherm('scherm-meedoen');
    var naam = document.getElementById('input-speler-naam');
    if (naam) { try { naam.focus(); } catch (e) {} }
  }
  var linkCode = leesCodeUitLink();
  if (linkCode) {
    openMeedoenMetCode(linkCode);
    // Voor de zekerheid nog een keer als de pagina klaar is met laden (alleen als je nog op het startscherm staat)
    window.addEventListener('load', function () {
      var actief = document.querySelector('.scherm.actief');
      if (actief && actief.id === 'scherm-algemeen') openMeedoenMetCode(linkCode);
    });
  }

  // ---------- 1. Quizmaster: QR-code in de wachtkamer ----------
  var codeEl = document.getElementById('host-wachtkamer-code');
  if (!codeEl || typeof qrcode !== 'function') return;

  var blok = document.createElement('div');
  blok.id = 'host-qr-blok';
  blok.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;margin:4px 0 6px;';
  blok.hidden = true;

  var kaart = document.createElement('div');
  kaart.style.cssText = 'background:#fff;padding:10px;border-radius:14px;width:min(62vw,260px);line-height:0;';

  var uitleg = document.createElement('p');
  uitleg.className = 'subtitel';
  uitleg.style.cssText = 'margin:0;text-align:center;';
  uitleg.textContent = 'Of scan deze QR-code met de camera van je telefoon';

  var linkTekst = document.createElement('p');
  linkTekst.style.cssText = 'margin:0;font-size:.85rem;opacity:.75;text-align:center;overflow-wrap:anywhere;max-width:100%;';

  var kopieer = document.createElement('button');
  kopieer.type = 'button';
  kopieer.className = 'btn btn-secondary';
  kopieer.textContent = '📋 Kopieer link';

  blok.appendChild(kaart);
  blok.appendChild(uitleg);
  blok.appendChild(linkTekst);
  blok.appendChild(kopieer);
  codeEl.parentNode.insertBefore(blok, codeEl.nextSibling);

  var huidigeLink = '';
  function meedoenLink(code) {
    return location.origin + location.pathname + '?code=' + encodeURIComponent(code);
  }
  function bouwQr() {
    var code = (codeEl.textContent || '').trim();
    if (!code) { blok.hidden = true; return; }
    huidigeLink = meedoenLink(code);
    try {
      var qr = qrcode(0, 'M');   // 0 = grootte automatisch kiezen
      qr.addData(huidigeLink);
      qr.make();
      kaart.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      var svg = kaart.querySelector('svg');
      if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block'; }
      linkTekst.textContent = huidigeLink;
      blok.hidden = false;
    } catch (e) {
      console.warn('[quizqr] QR-code maken mislukt:', e);
      blok.hidden = true;
    }
  }
  new MutationObserver(bouwQr).observe(codeEl, { childList: true, characterData: true, subtree: true });
  bouwQr();

  kopieer.addEventListener('click', function () {
    var klaar = function () {
      kopieer.textContent = '✅ Gekopieerd!';
      setTimeout(function () { kopieer.textContent = '📋 Kopieer link'; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(huidigeLink).then(klaar, function () { window.prompt('Kopieer deze link:', huidigeLink); });
    } else {
      window.prompt('Kopieer deze link:', huidigeLink);
    }
  });
})();
