// ============================================================================
// kist.js — de winkel als schatkistjes
//  1. In de winkel is elke mysteriebox een getekend schatkistje. Eronder staat wat
//     het is, de prijs en (als er een datum is) wanneer hij komt of weggaat.
//     Sitebeheer ziet daaronder ook alle andere info en knoppen.
//  2. Klik je op "Kopen", dan wordt de kist beeldvullend. Je tikt 3 keer op de kist;
//     bij elke tik kan hij beter worden (Gewoon > Zilver > Goud > Diamant). De
//     inhoud blijft hetzelfde, maar een betere kist geeft bonusmunten.
//     Daarna gaat hij open, zie je de inhoud op een rijtje en klik je door naar de
//     dierenverzameling.
// Dit bestand moet NA app.js en poppetjes.js geladen worden (zie index.html).
// ============================================================================
(function () {
  'use strict';

  // ---------- INSTELLINGEN (hier kun je alles makkelijk aanpassen) ----------
  // Kans dat een tik de kist één stapje beter maakt, per soort kist waar je nu mee bezig bent:
  //   gewoon -> zilver, zilver -> goud, goud -> diamant.  0.12 = 12% kans.
  var UPGRADE_KANS = [0.12, 0.10, 0.08];
  // Bonusmunten van een betere kist = percentage van de prijs, afgerond omhoog op 5,
  // maar minstens het minimum. Volgorde: gewoon, zilver, goud, diamant.
  var BONUS_PERCENTAGE = [0, 0.10, 0.30, 1.00];
  var BONUS_MINIMUM    = [0, 5, 15, 50];

  var TIERS = [
    { naam: 'Gewone kist',    lid: '#b07a40', body: '#8b5a2b', plank: '#6e4520', band: '#7d838c', bandDonker: '#4f545c', slot: '#f0c04d', glinster: '#ffe9a8' },
    { naam: 'Zilveren kist',  lid: '#e1e8f0', body: '#aeb9c6', plank: '#8794a3', band: '#6a7e93', bandDonker: '#3d4e60', slot: '#f0c04d', glinster: '#ffffff' },
    { naam: 'Gouden kist',    lid: '#ffdc55', body: '#e2a91d', plank: '#b9830c', band: '#b9770e', bandDonker: '#7b4a00', slot: '#e0405a', glinster: '#fff3b0' },
    { naam: 'Diamanten kist', lid: '#98e8ff', body: '#3fb0e0', plank: '#2a8ab8', band: '#eafaff', bandDonker: '#7fc6e0', slot: '#ffffff', glinster: '#d9f6ff' }
  ];

  var kistTeller = 0;

  // ---------- Het getekende schatkistje ----------
  function ster(x, y, s, kleur) {
    return '<path d="M' + x + ' ' + (y - s) + ' Q' + x + ' ' + y + ' ' + (x + s) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y + s) +
      ' Q' + x + ' ' + y + ' ' + (x - s) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y - s) + ' Z" fill="' + kleur + '"/>';
  }

  function kistSvg(tier) {
    var t = TIERS[tier] || TIERS[0];
    var id = 'kistlid' + (++kistTeller);
    var lidPad = 'M30 98 V74 Q30 26 110 26 Q190 26 190 74 V98 Z';
    var s = '<svg class="kist-svg kist-tier-' + tier + '" viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    s += '<defs><clipPath id="' + id + '"><path d="' + lidPad + '"/></clipPath></defs>';
    s += '<ellipse cx="110" cy="174" rx="82" ry="10" fill="rgba(0,0,0,.35)"/>';

    // Licht dat uit de kist komt als hij openstaat
    s += '<g class="kist-licht"><ellipse cx="110" cy="90" rx="74" ry="42" fill="#fff3b0" opacity=".5"/>';
    [-66, -42, -18, 6, 30, 54].forEach(function (hoek) {
      var a1 = (hoek - 7) * Math.PI / 180, a2 = (hoek + 7) * Math.PI / 180;
      s += '<polygon points="110,92 ' + (110 + Math.sin(a1) * 150).toFixed(1) + ',' + (92 - Math.cos(a1) * 150).toFixed(1) + ' ' +
        (110 + Math.sin(a2) * 150).toFixed(1) + ',' + (92 - Math.cos(a2) * 150).toFixed(1) + '" fill="#fff3b0" opacity=".28"/>';
    });
    s += '</g>';

    // Binnenkant met muntjes (alleen te zien als het deksel openstaat)
    s += '<rect x="36" y="86" width="148" height="18" rx="6" fill="#2a1a0a"/>';
    for (var i = 0; i < 7; i++) {
      s += '<ellipse cx="' + (49 + i * 20.5) + '" cy="' + (88 + (i % 2) * 3) + '" rx="11" ry="6.5" fill="#ffd84d" stroke="#c58f00" stroke-width="1.5"/>';
    }

    // Onderkant van de kist
    s += '<rect x="34" y="94" width="152" height="70" rx="8" fill="' + t.body + '"/>';
    s += '<path d="M34 118 H186 M34 140 H186" stroke="' + t.plank + '" stroke-width="2.5" opacity=".8"/>';
    s += '<rect x="34" y="152" width="152" height="12" rx="5" fill="' + t.plank + '"/>';
    [56, 148].forEach(function (x) {
      s += '<rect x="' + x + '" y="94" width="16" height="70" fill="' + t.band + '" stroke="' + t.bandDonker + '" stroke-width="1.5"/>';
      s += '<circle cx="' + (x + 8) + '" cy="104" r="2.6" fill="' + t.bandDonker + '"/><circle cx="' + (x + 8) + '" cy="154" r="2.6" fill="' + t.bandDonker + '"/>';
    });
    // Slot
    s += '<rect x="97" y="102" width="26" height="32" rx="6" fill="' + t.slot + '" stroke="' + t.bandDonker + '" stroke-width="2"/>';
    s += '<circle cx="110" cy="115" r="5.5" fill="#2a1a0a"/><rect x="108" y="116" width="4" height="12" rx="2" fill="#2a1a0a"/>';

    // Deksel
    s += '<g class="kist-deksel">';
    s += '<path d="' + lidPad + '" fill="' + t.lid + '"/>';
    s += '<g clip-path="url(#' + id + ')">';
    s += '<path d="M20 62 Q110 14 200 62" fill="none" stroke="' + t.plank + '" stroke-width="2.5" opacity=".55"/>';
    s += '<path d="M20 82 Q110 40 200 82" fill="none" stroke="' + t.plank + '" stroke-width="2.5" opacity=".55"/>';
    [56, 148].forEach(function (x) {
      s += '<rect x="' + x + '" y="10" width="16" height="92" fill="' + t.band + '" stroke="' + t.bandDonker + '" stroke-width="1.5"/>';
    });
    s += '</g>';
    s += '<path d="M44 76 Q52 46 100 36" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="6" stroke-linecap="round"/>';
    s += '<rect x="26" y="92" width="168" height="13" rx="5" fill="' + t.band + '" stroke="' + t.bandDonker + '" stroke-width="2"/>';
    s += '<path d="M97 92 h26 v16 q-13 9 -26 0 z" fill="' + t.slot + '" stroke="' + t.bandDonker + '" stroke-width="2"/>';
    if (tier === 2) s += '<circle cx="110" cy="54" r="9" fill="#e0405a" stroke="#7b4a00" stroke-width="2.5"/><circle cx="107" cy="51" r="2.6" fill="#fff" opacity=".8"/>';
    if (tier === 3) {
      s += '<polygon points="110,34 124,52 110,76 96,52" fill="#fff" stroke="#4cc3f0" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<polygon points="110,34 117,52 110,76" fill="#bdeeff" opacity=".7"/>';
    }
    s += '</g>';

    // Glinsters bij een betere kist
    if (tier >= 1) {
      s += '<g class="kist-glinster">' + ster(26, 40, 11, t.glinster) + ster(196, 58, 9, t.glinster) + ster(112, 14, 10, t.glinster) +
        (tier >= 2 ? ster(14, 108, 8, t.glinster) + ster(208, 120, 10, t.glinster) : '') + '</g>';
    }
    s += '</svg>';
    return s;
  }

  function bonusVoor(prijs, tier) {
    if (!tier) return 0;
    var uitPercentage = Math.ceil(((prijs || 0) * BONUS_PERCENTAGE[tier]) / 5) * 5;
    return Math.max(BONUS_MINIMUM[tier], uitPercentage);
  }

  // Bepaalt vooraf wat elke tik doet (het is al beslist op het moment van kopen).
  function rolUpgrades() {
    var tier = 0, ups = [];
    for (var i = 0; i < 3; i++) {
      var kans = tier < 3 ? UPGRADE_KANS[tier] : 0;
      var gelukt = Math.random() < kans;
      ups.push(gelukt);
      if (gelukt) tier++;
    }
    return { ups: ups, eindTier: tier };
  }

  // ---------- 1. De tegel in de winkel ----------
  // Vervangt bouwBoxKaartHtml uit app.js (zelfde knoppen en klassen, dus alles blijft werken).
  window.bouwBoxKaartHtml = function (boxId, box) {
    var aantalItems = (box.dieren || []).length + (box.accessoires || []).length;
    var isOffline = !!box.offline;
    var nogNietTeKoop = boxIsNogNietTeKoop(box);
    var automatischOffline = boxIsAutomatischOffline(box);
    var nietTeKoop = isOffline || nogNietTeKoop || automatischOffline;
    var genoegMunten = !nietTeKoop && haalMunten() >= (box.prijs || 0);
    var alGekocht = haalGekochteBoxen().indexOf(boxId) !== -1;

    var slotje = '';
    if (nogNietTeKoop) slotje = '<span class="kist-slot-teken">⏳</span>';
    else if (isOffline || automatischOffline) slotje = '<span class="kist-slot-teken">🔒</span>';

    var html = '<div class="kist-podium' + (nietTeKoop ? ' kist-vergrendeld' : '') + '">' + kistSvg(0) + slotje + '</div>';
    html += '<div class="quiz-item-body kist-body"><div class="quiz-item-info">' +
      '<strong>' + escapeHtml(box.naam || 'Mysteriekist') + '</strong>' +
      '<span class="kist-soort">🎁 Mysteriekist</span>' +
      '<span class="kist-prijs">🪙 ' + (box.prijs || 0) + ' munten</span>';
    if (alGekocht) html += '<span class="box-al-gekocht">✅ Al eerder gekocht</span>';

    // Wanneer komt hij / tot wanneer is hij te koop (voor iedereen)
    if (!sitebeheerActief) {
      if (nogNietTeKoop) html += '<span class="box-status box-status-vanaf">⏳ Binnenkort — ' + escapeHtml(lowerFirst(boxLooptijdTekst(box))) + '</span>';
      else if (box.vanafDatum || box.totDatum) html += '<span class="box-status box-status-vanaf">📅 ' + escapeHtml(boxLooptijdTekst(box)) + '</span>';
    } else {
      // Sitebeheer: alle andere info
      html += '<span>' + aantalItems + ' verrassing(en) erin</span>';
      html += '<span class="box-aantal-gekocht">🛒 ' + (box.aantalGekocht || 0) + 'x gekocht (door alle spelers)</span>';
      if (isOffline) {
        html += '<span class="box-status box-status-offline">🔒 Offline — alleen jij ziet deze kist</span>';
      } else if (automatischOffline) {
        html += '<span class="box-status box-status-offline">🔒 Automatisch offline sinds ' + escapeHtml(formatBoxDatum(box.totDatum)) + '</span>';
      } else if (nogNietTeKoop) {
        html += '<span class="box-status box-status-vanaf">⏳ ' + escapeHtml(boxLooptijdTekst(box)) +
          (box.teaserZichtbaar ? ' · spelers zien alvast dat hij eraan komt' : ' · nog helemaal onzichtbaar voor spelers') + '</span>';
      } else if (box.vanafDatum || box.totDatum) {
        html += '<span class="box-status box-status-vanaf">📅 ' + escapeHtml(boxLooptijdTekst(box)) + '</span>';
      }
    }
    html += '</div><div class="quiz-item-knoppen">' +
      '<button class="btn btn-primary btn-koop-box" data-box="' + boxId + '"' + (genoegMunten ? '' : ' disabled') + '>' +
      (nietTeKoop ? 'Nog niet te koop' : (genoegMunten ? 'Kopen' : 'Niet genoeg munten')) + '</button>';
    if (sitebeheerActief) {
      html += '<button type="button" class="btn-aanpassen-quiz btn-aanpassen-box" data-box="' + boxId + '">Aanpassen</button>' +
        '<button type="button" class="btn-blokkeren-quiz btn-offline-box' + (isOffline ? ' is-geblokkeerd' : '') + '" data-box="' + boxId + '">' +
        (isOffline ? '📶 Online zetten' : '📴 Offline halen') + '</button>' +
        '<button type="button" class="btn-verwijderen-quiz btn-verwijderen-box" data-box="' + boxId + '">Verwijderen</button>';
    }
    html += '</div></div>';
    return html;
  };

  // ---------- 2. Kopen en de beeldvullende kist ----------
  var kopenBezig = false;
  var staat = null;   // alles over de kist die nu open gaat

  window.koopMysteriebox = function (boxId) {
    if (kopenBezig) return;
    kopenBezig = true;
    db.ref('mysterieboxen/' + boxId).once('value').then(function (snapshot) {
      var box = snapshot.val();
      if (!box) {
        alert('Deze mysteriebox bestaat niet meer.');
        kopenBezig = false; laadWinkelBoxen(); return;
      }
      if (!sitebeheerActief && (box.offline || boxIsNogNietTeKoop(box) || boxIsAutomatischOffline(box))) {
        alert('Deze mysteriebox is nu niet te koop.');
        kopenBezig = false; laadWinkelBoxen(); return;
      }
      var prijs = box.prijs || 0;
      if (haalMunten() < prijs) {
        alert('Je hebt niet genoeg munten voor deze box.');
        kopenBezig = false; return;
      }

      // Wat had je al? (voor het label "Nieuw" of "Had je al")
      var hadDieren = haalBezitDieren().slice();
      var hadAcc = haalBezitAccessoires().slice();
      var items = [];
      (box.dieren || []).filter(function (d) { return DIER_TEKENINGEN[d]; }).forEach(function (d) {
        items.push({ soort: 'dier', waarde: d, naam: d, nieuw: hadDieren.indexOf(d) === -1 });
      });
      (box.accessoires || []).filter(function (a) { return ACCESSOIRES[a]; }).forEach(function (a) {
        items.push({ soort: 'accessoire', waarde: a, naam: ACCESSOIRES[a].naam, plek: ACCESSOIRES[a].plek, nieuw: hadAcc.indexOf(a) === -1 });
      });

      // Alles wordt meteen goed geschreven; de tikken hierna zijn alleen nog de onthulling.
      var worp = rolUpgrades();
      var bonus = bonusVoor(prijs, worp.eindTier);
      zetMunten(haalMunten() - prijs + bonus);
      voegBezitToe(box.dieren, box.accessoires);
      voegGekochteBoxToe(boxId);
      db.ref('mysterieboxen/' + boxId + '/aantalGekocht').transaction(function (huidig) { return (huidig || 0) + 1; });

      staat = { box: box, prijs: prijs, ups: worp.ups, eindTier: worp.eindTier, bonus: bonus, items: items, tier: 0, tik: 0, bezig: false, klaar: false };
      openKistScherm();
    }).catch(function () {
      kopenBezig = false;
      alert('Kopen is niet gelukt. Probeer het opnieuw.');
    });
  };

  function maakOverlay() {
    var el = document.getElementById('kist-open-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'kist-open-overlay';
    el.className = 'kist-overlay';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<div class="kist-open-kolom">' +
        '<h2 class="kist-open-naam"></h2>' +
        '<p class="kist-open-soort"></p>' +
        '<div class="kist-open-podium">' +
          '<button type="button" class="kist-open-knop" aria-label="Tik op de kist"><span class="kist-open-kist"></span></button>' +
          '<div class="kist-deeltjes"></div>' +
        '</div>' +
        '<div class="kist-tikken" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '<p class="kist-open-tekst" role="status"></p>' +
        '<button type="button" class="kist-overslaan">Overslaan ⏭</button>' +
        '<div class="kist-resultaat" hidden>' +
          '<h3 class="kist-resultaat-titel">Dit zat erin</h3>' +
          '<div class="kist-items"></div>' +
          '<p class="kist-bonus" hidden></p>' +
          '<div class="kist-acties">' +
            '<button type="button" class="btn btn-primary kist-naar-verzameling">🐾 Naar mijn dierenverzameling</button>' +
            '<button type="button" class="btn btn-secondary kist-naar-winkel">← Terug naar de winkel</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector('.kist-open-knop').addEventListener('click', tikOpKist);
    el.querySelector('.kist-overslaan').addEventListener('click', overslaan);
    el.querySelector('.kist-naar-verzameling').addEventListener('click', function () { sluitKistScherm('verzameling'); });
    el.querySelector('.kist-naar-winkel').addEventListener('click', function () { sluitKistScherm('winkel'); });
    return el;
  }

  function q(sel) { return document.getElementById('kist-open-overlay').querySelector(sel); }

  function toonKist(opties) {
    q('.kist-open-kist').innerHTML = kistSvg(staat.tier);
    q('.kist-open-soort').textContent = TIERS[staat.tier].naam;
    if (opties && opties.flits) {
      var kist = q('.kist-open-kist');
      kist.classList.remove('kist-flits'); void kist.offsetWidth; kist.classList.add('kist-flits');
      var soort = q('.kist-open-soort');
      soort.classList.remove('kist-pop'); void soort.offsetWidth; soort.classList.add('kist-pop');
    }
  }

  function zetTekst(t) { q('.kist-open-tekst').textContent = t; }

  function updateTikken() {
    var bolletjes = q('.kist-tikken').children;
    for (var i = 0; i < bolletjes.length; i++) bolletjes[i].classList.toggle('aan', i < staat.tik);
  }

  function openKistScherm() {
    var el = maakOverlay();
    el.classList.remove('kist-klaar');
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    q('.kist-open-naam').textContent = staat.box.naam || 'Mysteriekist';
    q('.kist-resultaat').hidden = true;
    q('.kist-open-knop').disabled = false;
    q('.kist-overslaan').hidden = false;
    q('.kist-tikken').hidden = false;
    q('.kist-deeltjes').innerHTML = '';
    el.scrollTop = 0;
    toonKist();
    updateTikken();
    zetTekst('Tik 3 keer op de kist! Misschien wordt hij wel beter… ✨');
  }

  function tikOpKist() {
    if (!staat || staat.bezig || staat.klaar || staat.tik >= 3) return;
    staat.bezig = true;
    var knop = q('.kist-open-knop');
    knop.classList.remove('kist-schud'); void knop.offsetWidth; knop.classList.add('kist-schud');
    var nu = staat.tik;
    staat.tik++;
    updateTikken();
    zetTekst('…');
    setTimeout(function () {
      knop.classList.remove('kist-schud');
      if (staat.ups[nu]) {
        staat.tier++;
        toonKist({ flits: true });
        spat(14);
        var b = bonusVoor(staat.prijs, staat.tier);
        zetTekst('✨ Upgrade! Je kist is nu een ' + TIERS[staat.tier].naam.toLowerCase() + '!' + (b ? ' Dat is 🪙 ' + b + ' bonusmunten.' : ''));
      } else if (staat.tik === 1) {
        zetTekst('Nog dezelfde kist… tik nog eens!');
      } else if (staat.tik === 2) {
        zetTekst('Nog één tik! Wordt hij nog beter?');
      }
      if (staat.tik >= 3) {
        if (!staat.ups[nu] && staat.tier === 0) zetTekst('Geen upgrade deze keer. Maar kijk wat erin zit!');
        setTimeout(openDeKist, 1100);
      } else {
        staat.bezig = false;
      }
    }, 520);
  }

  function overslaan() {
    if (!staat || staat.klaar) return;
    staat.tik = 3;
    staat.tier = staat.eindTier;
    staat.bezig = true;
    toonKist();
    updateTikken();
    openDeKist();
  }

  function spat(n) {
    var cont = q('.kist-deeltjes');
    var tekens = ['✨', '🪙', '⭐'];
    for (var i = 0; i < n; i++) {
      var d = document.createElement('span');
      d.textContent = tekens[i % tekens.length];
      d.style.setProperty('--dx', (Math.random() * 280 - 140).toFixed(0) + 'px');
      d.style.setProperty('--dy', (-60 - Math.random() * 190).toFixed(0) + 'px');
      d.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
      cont.appendChild(d);
      (function (x) { setTimeout(function () { if (x.parentNode) x.parentNode.removeChild(x); }, 1800); })(d);
    }
  }

  function itemPlaatje(item) {
    if (item.soort === 'dier') return poppetjeSvg(item.waarde, {});
    var voorbeeld = {};
    voorbeeld[item.plek] = item.waarde;
    var dier = DIEREN.indexOf('🐶') !== -1 ? '🐶' : DIEREN[0];
    return poppetjeSvg(dier, voorbeeld);
  }

  function openDeKist() {
    staat.klaar = true;
    var el = document.getElementById('kist-open-overlay');
    q('.kist-open-knop').disabled = true;
    q('.kist-overslaan').hidden = true;
    q('.kist-open-soort').textContent = TIERS[staat.tier].naam + ' geopend!';
    zetTekst('');
    // Deksel open
    var svg = q('.kist-open-kist .kist-svg');
    if (svg) svg.classList.add('kist-open');
    spat(18);
    setTimeout(function () {
      el.classList.add('kist-klaar');
      q('.kist-tikken').hidden = true;
      var lijst = q('.kist-items');
      lijst.innerHTML = '';
      if (!staat.items.length) {
        lijst.innerHTML = '<p class="subtitel">Deze kist was leeg.</p>';
      }
      staat.items.forEach(function (item, i) {
        var kaart = document.createElement('div');
        kaart.className = 'kist-item' + (item.nieuw ? ' kist-item-nieuw' : '');
        kaart.style.animationDelay = (0.15 + i * 0.12).toFixed(2) + 's';
        kaart.innerHTML = '<div class="kist-item-plaatje">' + itemPlaatje(item) + '</div>' +
          '<span class="kist-item-naam">' + escapeHtml(item.soort === 'dier' ? 'Poppetje' : item.naam) + '</span>' +
          '<span class="kist-item-label">' + (item.nieuw ? '🆕 Nieuw!' : 'Had je al') + '</span>';
        lijst.appendChild(kaart);
      });
      var bonusEl = q('.kist-bonus');
      if (staat.bonus > 0) {
        bonusEl.textContent = '🪙 +' + staat.bonus + ' bonusmunten erbij door je ' + TIERS[staat.tier].naam.toLowerCase() + '!';
        bonusEl.hidden = false;
      } else {
        bonusEl.hidden = true;
      }
      q('.kist-resultaat').hidden = false;
    }, 900);
  }

  function sluitKistScherm(waarheen) {
    var el = document.getElementById('kist-open-overlay');
    if (el) el.hidden = true;
    document.body.style.overflow = '';
    kopenBezig = false;
    staat = null;
    werkMuntenWeergaveBij();
    if (waarheen === 'verzameling') {
      toonScherm('scherm-dierenverzameling');
      bouwVerzamelingKiezer();
      window.scrollTo(0, 0);
    } else {
      laadWinkelBoxen();
    }
  }
})();
