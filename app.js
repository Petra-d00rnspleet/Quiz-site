
// ---------- Sitebeheer (echt inloggen via Firebase Authentication) ----------
//
// De beheerder logt in met een e-mailadres + wachtwoord dat in de Firebase
// Console staat (Authentication -> Users), niet in deze broncode. Zie de
// readme voor hoe je dat account daar aanmaakt. Firebase onthoudt het
// ingelogd zijn automatisch, dus na een herlaadbeurt blijft de beheerder
// ingelogd tot er bewust wordt uitgelogd.

let sitebeheerActief = false;

// Voor gewone spelers gebruiken we anonieme Firebase-authenticatie. Daardoor
// krijgt iedere browser een eigen veilige Firebase-ID zonder dat er een wachtwoord
// nodig is. Die ID koppelen we aan de gekozen gebruikersnaam voor vrienden/chat.
function zorgVoorSocialeGebruiker() {
  if (typeof auth === 'undefined') return;
  if (!auth.currentUser) {
    auth.signInAnonymously().catch(() => {});
  }
}

const sitebeheerOverlayEl = document.getElementById('sitebeheer-overlay');
const inputSitebeheerEmailEl = document.getElementById('input-sitebeheer-email');
const inputSitebeheerWachtwoordEl = document.getElementById('input-sitebeheer-wachtwoord');
const sitebeheerFoutmeldingEl = document.getElementById('sitebeheer-foutmelding');
const btnSitebeheerEl = document.getElementById('btn-sitebeheer');
const btnSitebeheerBevestigenEl = document.getElementById('btn-sitebeheer-bevestigen');

function openSitebeheerOverlay() {
  sitebeheerFoutmeldingEl.textContent = '';
  inputSitebeheerEmailEl.value = '';
  inputSitebeheerWachtwoordEl.value = '';
  sitebeheerOverlayEl.classList.add('actief');
  inputSitebeheerEmailEl.focus();
}

function sluitSitebeheerOverlay() {
  sitebeheerOverlayEl.classList.remove('actief');
}

function werkSitebeheerKnopBij() {
  if (sitebeheerActief) {
    btnSitebeheerEl.classList.add('actief');
    btnSitebeheerEl.textContent = '🔓 Sitebeheer actief';
  } else {
    btnSitebeheerEl.classList.remove('actief');
    btnSitebeheerEl.textContent = '⚙ Sitebeheer';
  }
}

btnSitebeheerEl.addEventListener('click', () => {
  if (sitebeheerActief) {
    // Al ingelogd: nogmaals klikken logt meteen uit.
    auth.signOut();
    return;
  }
  openSitebeheerOverlay();
});

document.getElementById('btn-sitebeheer-annuleren').addEventListener('click', () => {
  sluitSitebeheerOverlay();
});

function probeerSitebeheerInloggen() {
  const email = inputSitebeheerEmailEl.value.trim();
  const wachtwoord = inputSitebeheerWachtwoordEl.value;

  if (!email || !wachtwoord) {
    sitebeheerFoutmeldingEl.textContent = 'Vul e-mailadres en wachtwoord in.';
    return;
  }

  sitebeheerFoutmeldingEl.textContent = '';
  btnSitebeheerBevestigenEl.disabled = true;
  btnSitebeheerBevestigenEl.textContent = 'Bezig...';

  auth.signInWithEmailAndPassword(email, wachtwoord)
    .then(() => {
      // sitebeheerActief wordt automatisch gezet via onAuthStateChanged hieronder.
      sluitSitebeheerOverlay();
    })
    .catch(() => {
      sitebeheerFoutmeldingEl.textContent = 'Inloggen mislukt: onjuist e-mailadres of wachtwoord.';
    })
    .finally(() => {
      btnSitebeheerBevestigenEl.disabled = false;
      btnSitebeheerBevestigenEl.textContent = 'Inloggen';
    });
}

btnSitebeheerBevestigenEl.addEventListener('click', probeerSitebeheerInloggen);

[inputSitebeheerEmailEl, inputSitebeheerWachtwoordEl].forEach(veld => {
  veld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      probeerSitebeheerInloggen();
    }
  });
});

auth.onAuthStateChanged(gebruiker => {
  sitebeheerActief = !!gebruiker && !gebruiker.isAnonymous;
  werkSitebeheerKnopBij();
  if (gebruiker && !gebruiker.isAnonymous) {
    // Beheerder-account: niets extra's nodig.
  } else if (!gebruiker) {
    zorgVoorSocialeGebruiker();
  }
  if (typeof laadSocialeGegevens === 'function') laadSocialeGegevens();
  if (document.getElementById('scherm-speelbare-quizzen').classList.contains('actief')) {
    laadOpenbareQuizzen();
  }
  if (document.getElementById('scherm-quizmaken').classList.contains('actief')) {
    laadEigenQuizzen();
  }
});

zorgVoorSocialeGebruiker();

// ---------- Naam van de quizmaker (verplicht, eenmalig, niet meer te wijzigen) ----------
//
// Voordat iemand een quiz kan maken, moet die zijn/haar naam invullen. Deze
// naam wordt lokaal onthouden (localStorage) en bij elke quiz die diegene
// maakt als "makerNaam" opgeslagen in Firebase. Uit privacy wordt de naam
// op de site NIET getoond aan gewone bezoekers; alleen sitebeheer (ingelogd)
// ziet bij Speelbare quizzen wie een quiz heeft gemaakt.
// De maker zelf kan zijn/haar naam achteraf niet wijzigen. Sitebeheer kan dat
// wel, via "Naam wijzigen" bij "Alle quizmakers" (zie toonSitebeheerMakersOverzicht).

const MAKER_NAAM_SLEUTEL = 'makerNaam';
const PROFIEL_DIER_SLEUTEL = 'profielDier';

function huidigeMakerNaam() {
  return localStorage.getItem(MAKER_NAAM_SLEUTEL);
}

function huidigProfielDier() {
  return localStorage.getItem(PROFIEL_DIER_SLEUTEL) || '';
}

// Een profiel bestaat zodra er een gebruikersnaam is. Het poppetje komt er
// idealiiter gelijk bij, maar is geen harde eis: heb je (nog) geen enkel
// poppetje in bezit (bijv. omdat je ze allemaal verkocht hebt), dan kun je
// nog steeds een profiel hebben en later alsnog een poppetje kiezen zodra je
// er weer een hebt.
function heeftProfiel() {
  return !!huidigeMakerNaam();
}

// Onthoudt welk poppetje net gekozen is op het profiel-maken-scherm, vóórdat
// er op "Profiel aanmaken" geklikt is.
let profielGekozenDier = '';

// Onthoudt wat er moet gebeuren zodra het profiel is aangemaakt (welk scherm
// tonen en welke gegevens erbij laden), zodat "Quiz maken", "Winkel",
// "Dierenverzameling" en "Geluksrad" na het aanmaken van een profiel meteen
// verdergaan naar waar de bezoeker eigenlijk heen wilde.
let naProfielActie = null;

// Bouwt een poppetje-kiezer (alleen dieren die je al bezit, zonder accessoires)
// in het meegegeven element. Heb je nog geen enkel poppetje in bezit, dan komt
// er gewoon een uitleg te staan in plaats van een lege/onbruikbare kiezer.
// onKiezen(dier) wordt aangeroepen zodra er op een poppetje geklikt wordt.
function bouwPoppetjeKiezer(containerEl, huidigeWaarde, onKiezen) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
  const bezitDieren = haalBezitDieren();

  if (!bezitDieren.length) {
    const hint = document.createElement('p');
    hint.className = 'kiezer-hint';
    hint.textContent = 'Je hebt nog geen enkel poppetje om te kiezen. Verdien of win er eerst één (bijv. bij de Winkel of het Geluksrad).';
    containerEl.appendChild(hint);
    return;
  }

  bezitDieren.forEach(dier => {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'dier-knop';
    knop.innerHTML = poppetjeSvg(dier, {});
    knop.dataset.dier = dier;
    knop.classList.toggle('gekozen', dier === huidigeWaarde);
    knop.setAttribute('aria-label', 'Kies ' + dier + ' als profielfoto');
    knop.addEventListener('click', () => {
      onKiezen(dier);
      containerEl.querySelectorAll('.dier-knop').forEach(k => k.classList.toggle('gekozen', k.dataset.dier === dier));
    });
    containerEl.appendChild(knop);
  });
}

// Bouwt de poppetje-kiezer op het profiel-maken-scherm.
function bouwProfielDierenKiezer() {
  const kiezerEl = document.getElementById('profiel-dieren-kiezer');
  bouwPoppetjeKiezer(kiezerEl, profielGekozenDier, (dier) => { profielGekozenDier = dier; });
}

// Werkt de badge rechtsboven bij: toont poppetje + naam als er een profiel
// is, anders een knop om er een aan te maken.
function werkProfielBadgeBij() {
  const poppetjeEl = document.getElementById('profiel-badge-poppetje');
  const tekstEl = document.getElementById('profiel-badge-tekst');
  if (heeftProfiel()) {
    poppetjeEl.textContent = huidigProfielDier();
    tekstEl.textContent = huidigeMakerNaam();
  } else {
    poppetjeEl.textContent = '';
    tekstEl.textContent = '👤 Profiel maken';
  }
}

// Opent het profiel-maken-scherm. Is er al een naam maar nog geen poppetje
// (bijv. van vóór deze functie bestond), dan staat de naam alvast klaar en
// hoeft alleen nog een poppetje gekozen te worden.
function openProfielMakenScherm() {
  inputMakerNaamEl.value = huidigeMakerNaam() || '';
  naamInvullenFoutmeldingEl.textContent = '';
  profielGekozenDier = geldigDier(huidigProfielDier());
  bouwProfielDierenKiezer();
  toonScherm('scherm-naam-invullen');
}

// Zorgt dat een schermwissel alleen doorgaat als er al een profiel is; is er
// nog geen profiel, dan wordt eerst het profiel-maken-scherm getoond en gaat
// het na het aanmaken automatisch verder naar "actie".
function metProfielVereist(actie) {
  if (heeftProfiel()) {
    actie();
  } else {
    naProfielActie = actie;
    openProfielMakenScherm();
  }
}

// Tekst veilig in innerHTML zetten (namen en titels komen van gebruikers).
function escapeHtml(tekst) {
  return String(tekst == null ? '' : tekst)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Tekst " · Door <naam>" achter een quiz. Uit privacy alleen voor sitebeheer;
// voor gewone bezoekers is dit altijd leeg.
function doorTekstVoorMaker(makerNaam) {
  if (!sitebeheerActief) return '';
  return makerNaam ? ' · Door ' + escapeHtml(makerNaam) : ' · Door: naam onbekend';
}

// Zet de naam van de maker automatisch bij ALLE quizzen die op dit apparaat
// zijn gemaakt en nog geen naam hebben (bijv. quizzen van vóórdat de naam werd
// ingevuld). Zo staat de naam ook bij oudere quizzen in "Speelbare quizzen".
// Deze functie geeft altijd een Promise terug die nooit faalt.
function koppelMakerNaamAanEigenQuizzen() {
  const naam = huidigeMakerNaam();
  if (!naam) return Promise.resolve();

  let eigenQuizzen = [];
  try {
    eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
  } catch (e) {
    return Promise.resolve();
  }

  return Promise.all(
    eigenQuizzen.map(q =>
      db.ref('quizzen/' + q.code).once('value').then(snapshot => {
        // Alleen bijwerken als de quiz nog bestaat en nog geen naam heeft
        // (anders zouden we een verwijderde quiz per ongeluk opnieuw aanmaken).
        if (snapshot.child('titel').exists() && !snapshot.child('makerNaam').val()) {
          return db.ref('quizzen/' + q.code + '/makerNaam').set(naam);
        }
      }).catch(() => {})
    )
  ).catch(() => {});
}

const inputMakerNaamEl = document.getElementById('input-maker-naam');
const naamInvullenFoutmeldingEl = document.getElementById('naam-invullen-foutmelding');

function bevestigMakerNaam() {
  const naam = inputMakerNaamEl.value.trim();
  if (!naam) {
    naamInvullenFoutmeldingEl.textContent = 'Vul je naam in.';
    return;
  }
  // Een poppetje kiezen is alleen verplicht als er ook echt iets te kiezen
  // valt; heb je (nog) geen enkel poppetje, dan kun je zonder verder.
  if (haalBezitDieren().length && !profielGekozenDier) {
    naamInvullenFoutmeldingEl.textContent = 'Kies ook een poppetje als profielfoto.';
    return;
  }
  localStorage.setItem(MAKER_NAAM_SLEUTEL, naam);
  if (profielGekozenDier) {
    localStorage.setItem(PROFIEL_DIER_SLEUTEL, profielGekozenDier);
  }
  registreerSociaalProfiel();
  werkProfielBadgeBij();
  werkVakSlotjesBij();

  const actie = naProfielActie;
  naProfielActie = null;

  if (actie) {
    actie();
  } else {
    toonScherm('scherm-quizmaken');
    laadEigenQuizzen();
  }
  // Eerst de naam bij bestaande quizzen zetten (voor het geval er al oudere
  // quizzen van dit apparaat bestaan zonder naam).
  koppelMakerNaamAanEigenQuizzen();
}

document.getElementById('btn-naam-bevestigen').addEventListener('click', bevestigMakerNaam);

inputMakerNaamEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    bevestigMakerNaam();
  }
});

// ---------- Navigatie tussen schermen ----------

function toonScherm(id) {
  document.querySelectorAll('.scherm').forEach(el => el.classList.remove('actief'));
  document.getElementById(id).classList.add('actief');
}

document.getElementById('btn-naar-quizmaken').addEventListener('click', () => {
  metProfielVereist(() => {
    toonScherm('scherm-quizmaken');
    laadEigenQuizzen();
  });
});

document.getElementById('btn-naar-speelbaar').addEventListener('click', () => {
  toonScherm('scherm-speelbare-quizzen');
  laadOpenbareQuizzen();
});

document.getElementById('btn-naar-meedoen').addEventListener('click', () => {
  toonScherm('scherm-meedoen');
});

document.getElementById('btn-naar-dierentuin').addEventListener('click', () => {
  metProfielVereist(() => {
    toonScherm('scherm-dierenverzameling');
    werkMuntenWeergaveBij();
    bouwVerzamelingKiezer();
  });
});

document.querySelectorAll('[data-terug-naar]').forEach(knop => {
  knop.addEventListener('click', () => {
    const doel = knop.getAttribute('data-terug-naar');
    toonScherm(doel);
    if (doel === 'scherm-quizmaken') {
      laadEigenQuizzen();
    }
  });
});

// Terug-knop op het bewerkformulier gaat terug naar waar we vandaan kwamen:
// "Mijn quizzen" normaal, of "Speelbare quizzen" als sitebeheer een openbare
// quiz van iemand anders aan het aanpassen was.
document.getElementById('btn-nieuwe-quiz-terug').addEventListener('click', () => {
  const bestemming = huidigeBewerkTerugScherm || 'scherm-quizmaken';
  huidigeBewerkCode = null;
  huidigeBewerkTerugScherm = 'scherm-quizmaken';
  toonScherm(bestemming);
  if (bestemming === 'scherm-speelbare-quizzen') {
    laadOpenbareQuizzen();
  } else {
    laadEigenQuizzen();
  }
});

// ---------- Omslagfoto's (standaard-galerij + eigen upload) ----------

function maakStandaardOmslag(embleem, label, kleurVan, kleurNaar) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${kleurVan}"/>
          <stop offset="100%" stop-color="${kleurNaar}"/>
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#g)"/>
      <circle cx="70" cy="45" r="2" fill="#ffe9a8" opacity="0.85"/>
      <circle cx="135" cy="215" r="1.6" fill="#ffe9a8" opacity="0.7"/>
      <circle cx="405" cy="38" r="1.8" fill="#ffe9a8" opacity="0.8"/>
      <circle cx="425" cy="205" r="2.2" fill="#ffe9a8" opacity="0.6"/>
      <circle cx="55" cy="185" r="1.4" fill="#ffe9a8" opacity="0.6"/>
      <circle cx="350" cy="230" r="1.5" fill="#ffe9a8" opacity="0.6"/>
      <text x="240" y="145" font-size="92" text-anchor="middle" dominant-baseline="middle">${embleem}</text>
      <text x="240" y="222" font-size="22" font-family="system-ui, sans-serif" font-weight="700" fill="#fff8e1" text-anchor="middle" opacity="0.9">${label}</text>
    </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const STANDAARD_OMSLAGEN = [
  { id: 'trofee', url: maakStandaardOmslag('🏆', 'Algemene kennis', '#1c2456', '#05081c') },
  { id: 'gloeilamp', url: maakStandaardOmslag('💡', 'Weetjes', '#2a1c40', '#0a0620') },
  { id: 'wereldbol', url: maakStandaardOmslag('🌍', 'Aardrijkskunde', '#0d2a3a', '#04101c') },
  { id: 'boek', url: maakStandaardOmslag('📚', 'Schoolquiz', '#1a1230', '#050816') },
  { id: 'sterren', url: maakStandaardOmslag('✨', 'Sterrenquiz', '#141a3c', '#03050f') },
  { id: 'vraagteken', url: maakStandaardOmslag('❓', 'Mysterie', '#241638', '#060310') }
];

let geselecteerdeOmslagUrl = STANDAARD_OMSLAGEN[0].url;

const omslagPreviewImg = document.getElementById('omslag-preview-img');
const omslagGalerijEl = document.getElementById('omslag-galerij');

function toonOmslagPreview(url) {
  geselecteerdeOmslagUrl = url;
  omslagPreviewImg.src = url;
}

function bouwOmslagGalerij(actieveUrl) {
  omslagGalerijEl.innerHTML = '';
  STANDAARD_OMSLAGEN.forEach(optie => {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'omslag-optie' + (optie.url === actieveUrl ? ' geselecteerd' : '');
    knop.innerHTML = `<img src="${optie.url}" alt="${optie.id}">`;
    knop.addEventListener('click', () => {
      toonOmslagPreview(optie.url);
      omslagGalerijEl.querySelectorAll('.omslag-optie').forEach(el => el.classList.remove('geselecteerd'));
      knop.classList.add('geselecteerd');
    });
    omslagGalerijEl.appendChild(knop);
  });
}

function leesEnVerkleinAfbeelding(bestand) {
  return new Promise((resolve, reject) => {
    const lezer = new FileReader();
    lezer.onload = () => {
      const img = new Image();
      img.onload = () => {
        const doelBreedte = 480;
        const doelHoogte = 270;
        const canvas = document.createElement('canvas');
        canvas.width = doelBreedte;
        canvas.height = doelHoogte;
        const ctx = canvas.getContext('2d');

        const schaal = Math.max(doelBreedte / img.width, doelHoogte / img.height);
        const geschaaldeBreedte = img.width * schaal;
        const geschaaldeHoogte = img.height * schaal;
        const x = (doelBreedte - geschaaldeBreedte) / 2;
        const y = (doelHoogte - geschaaldeHoogte) / 2;
        ctx.drawImage(img, x, y, geschaaldeBreedte, geschaaldeHoogte);

        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => reject(new Error('Kon de afbeelding niet lezen.'));
      img.src = lezer.result;
    };
    lezer.onerror = () => reject(new Error('Kon het bestand niet lezen.'));
    lezer.readAsDataURL(bestand);
  });
}

document.getElementById('btn-omslag-uploaden').addEventListener('click', () => {
  document.getElementById('input-omslag-bestand').click();
});

document.getElementById('input-omslag-bestand').addEventListener('change', (e) => {
  const bestand = e.target.files[0];
  if (!bestand) return;

  leesEnVerkleinAfbeelding(bestand)
    .then(dataUrl => {
      toonOmslagPreview(dataUrl);
      omslagGalerijEl.querySelectorAll('.omslag-optie').forEach(el => el.classList.remove('geselecteerd'));
    })
    .catch(err => {
      document.getElementById('quizmaken-foutmelding').textContent = 'Foto uploaden mislukt: ' + err.message;
    })
    .finally(() => {
      e.target.value = '';
    });
});



const vragenContainer = document.getElementById('vragen-container');
const sjabloonVraagBlok = document.getElementById('sjabloon-vraag-blok');

// Als dit null is, wordt er een nieuwe quiz gemaakt. Anders wordt de quiz
// met deze code bewerkt en overschreven in plaats van dat er een nieuwe
// code wordt aangemaakt.
let huidigeBewerkCode = null;

// Naar welk scherm we teruggaan na het opslaan/annuleren van het bewerkformulier.
// Normaal 'scherm-quizmaken' (Mijn quizzen), maar als sitebeheer een quiz
// aanpast vanuit "Speelbare quizzen", dan 'scherm-speelbare-quizzen'.
let huidigeBewerkTerugScherm = 'scherm-quizmaken';

// Is de quiz die nu bewerkt wordt geblokkeerd door sitebeheer? Zo ja, dan kan
// "openbaar" niet aangevinkt worden totdat sitebeheer de quiz deblokkeert.
let huidigeBewerkGeblokkeerd = false;

// Tijd per vraag bij live hosten (wekker), in seconden. De keuzeopties (10/15/
// 20/25/30) staan in de <select id="input-tijdslimiet"> in index.html. Oudere
// quizzen zonder dit veld gebruiken de standaardwaarde hieronder.
const TIJDSLIMIET_STANDAARD = 20;

// ---------- Hulpfuncties voor vragen (meerdere goede antwoorden, 2 of 4 opties) ----------
//
// Een vraag wordt overal in de app in dit formaat gebruikt:
//   { vraag: "...", antwoorden: [...2 of 4 stuks...], goedAntwoorden: [1, 3, ...] }
// Oudere quizzen (gemaakt vóór deze functie) hebben nog een los veld
// `goedAntwoord` (één getal) in plaats van `goedAntwoorden` (een lijst).
// normaliseerVraag() zorgt dat de rest van de app altijd met `goedAntwoorden` werkt.

function normaliseerVraag(vraag) {
  let goedAntwoorden = vraag.goedAntwoorden;
  if (!goedAntwoorden) {
    goedAntwoorden = vraag.goedAntwoord ? [vraag.goedAntwoord] : [];
  }
  // Oudere vragen (gemaakt vóór punten instelbaar waren) hebben geen `punten`
  // veld; die tellen gewoon als 1000, zoals voorheen altijd het geval was.
  const punten = (typeof vraag.punten === 'number' && vraag.punten >= 0) ? vraag.punten : 1000;
  return {
    vraag: vraag.vraag,
    antwoorden: vraag.antwoorden || [],
    goedAntwoorden: goedAntwoorden,
    afbeelding: vraag.afbeelding || '',
    punten: punten
  };
}

// Zet een getal om naar een leesbare tekst met duizendtal-punten (Nederlandse notatie),
// bijv. 1000000 -> "1.000.000". Wordt gebruikt om het puntenveld mooi te tonen.
function formatPunten(getal) {
  return getal.toLocaleString('nl-NL');
}

// Leest het puntenveld van een vraagblok. Haalt eerst alles weg wat geen cijfer is
// (dus ook duizendtal-punten of -komma's die iemand zelf intypt, bijv. "1.000.000"),
// zodat grote aantallen punten nooit per ongeluk als ongeldig worden gezien en stil
// terugvallen op de standaardwaarde.
function leesPuntenWaarde(blokEl) {
  const ruweTekst = blokEl.querySelector('.veld-punten').value;
  const cijfers = ruweTekst.replace(/[^\d]/g, '');
  if (!cijfers) return 1000; // leeg veld: terugvallen op de standaardwaarde
  const getal = parseInt(cijfers, 10);
  return (Number.isFinite(getal) && getal >= 0) ? getal : 1000;
}

// Zet een getal netjes geformatteerd in het puntenveld van een vraagblok.
function zetPuntenWaarde(blokEl, getal) {
  const veilig = Math.max(0, getal);
  blokEl.querySelector('.veld-punten').value = formatPunten(veilig);
}

// Vergelijkt twee lijsten met antwoordnummers zonder rekening te houden met volgorde.
function setsGelijk(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  const aSorted = [...a].sort();
  const bSorted = [...b].sort();
  return aSorted.every((waarde, i) => waarde === bSorted[i]);
}

// Toont/verbergt de antwoord-invoerrijen 3 en 4 in een vraagblok, afhankelijk
// van of er 2 of 4 antwoorden gekozen zijn. Bij verbergen worden die velden
// ook geleegd zodat ze niet per ongeluk meegestuurd worden.
function werkAantalAntwoordenZichtbaarheidBij(blokEl, aantal) {
  const rijen = blokEl.querySelectorAll('.antwoord-invoer-rij');
  rijen.forEach((rij, i) => {
    if (i < aantal) {
      rij.classList.remove('verborgen');
    } else {
      rij.classList.add('verborgen');
      rij.querySelector('.veld-antwoord').value = '';
      rij.querySelector('.veld-goed-vinkje').checked = false;
    }
  });
}

// Foto bij een vraag: verhouding blijft behouden (niet bijsnijden), maximaal
// 800 px breed/hoog zodat de quiz niet te zwaar wordt in Firebase.
function leesEnVerkleinVraagFoto(bestand) {
  return new Promise((resolve, reject) => {
    const lezer = new FileReader();
    lezer.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxAfmeting = 800;
        const schaal = Math.min(1, maxAfmeting / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * schaal));
        canvas.height = Math.max(1, Math.round(img.height * schaal));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // doorzichtige png's krijgen een witte achtergrond
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => reject(new Error('Kon de afbeelding niet lezen.'));
      img.src = lezer.result;
    };
    lezer.onerror = () => reject(new Error('Kon het bestand niet lezen.'));
    lezer.readAsDataURL(bestand);
  });
}

// Zet (of verwijdert, bij lege url) de foto van één vraagblok in het formulier.
function zetVraagFoto(blokEl, url) {
  blokEl._afbeelding = url || '';
  const previewEl = blokEl.querySelector('.vraag-foto-preview');
  const verwijderKnop = blokEl.querySelector('.btn-vraag-foto-verwijderen');
  const kiesKnop = blokEl.querySelector('.btn-vraag-foto-kiezen');
  if (url) {
    previewEl.src = url;
    previewEl.hidden = false;
    verwijderKnop.hidden = false;
    kiesKnop.textContent = 'Andere foto uploaden';
  } else {
    previewEl.removeAttribute('src');
    previewEl.hidden = true;
    verwijderKnop.hidden = true;
    kiesKnop.textContent = 'Foto uploaden';
  }
}

function vernummerVraagBlokken() {
  const blokken = vragenContainer.querySelectorAll('.vraag-blok');
  blokken.forEach((blok, index) => {
    blok.querySelector('.vraag-blok-titel').textContent = 'Vraag ' + (index + 1);
  });
}

function voegVraagBlokToe(vraagData) {
  const kloon = sjabloonVraagBlok.content.cloneNode(true);
  const blokEl = kloon.querySelector('.vraag-blok');

  if (vraagData) {
    const genormaliseerd = normaliseerVraag(vraagData);
    const aantalAntwoorden = genormaliseerd.antwoorden.length === 2 ? 2 : 4;

    blokEl.querySelector('.veld-vraag').value = genormaliseerd.vraag;
    blokEl.querySelector('.veld-aantal-antwoorden').value = String(aantalAntwoorden);
    zetPuntenWaarde(blokEl, genormaliseerd.punten);

    const antwoordVelden = blokEl.querySelectorAll('.veld-antwoord');
    const goedVinkjes = blokEl.querySelectorAll('.veld-goed-vinkje');
    antwoordVelden.forEach((veld, i) => {
      veld.value = genormaliseerd.antwoorden[i] || '';
    });
    goedVinkjes.forEach((vinkje, i) => {
      vinkje.checked = genormaliseerd.goedAntwoorden.includes(i + 1);
    });

    werkAantalAntwoordenZichtbaarheidBij(blokEl, aantalAntwoorden);
    zetVraagFoto(blokEl, genormaliseerd.afbeelding);
  } else {
    werkAantalAntwoordenZichtbaarheidBij(blokEl, 4);
    zetVraagFoto(blokEl, '');
  }

  const vraagFotoBestandEl = blokEl.querySelector('.veld-vraag-foto-bestand');
  blokEl.querySelector('.btn-vraag-foto-kiezen').addEventListener('click', () => {
    vraagFotoBestandEl.click();
  });
  blokEl.querySelector('.btn-vraag-foto-verwijderen').addEventListener('click', () => {
    zetVraagFoto(blokEl, '');
  });
  vraagFotoBestandEl.addEventListener('change', (e) => {
    const bestand = e.target.files[0];
    if (!bestand) return;
    leesEnVerkleinVraagFoto(bestand)
      .then(dataUrl => {
        zetVraagFoto(blokEl, dataUrl);
      })
      .catch(err => {
        document.getElementById('quizmaken-foutmelding').textContent = 'Foto uploaden mislukt: ' + err.message;
      })
      .finally(() => {
        e.target.value = '';
      });
  });

  // Punten-stappenteller: +/- knoppen tellen in stappen van 50 op/af, en het veld
  // wordt na het typen automatisch netjes geformatteerd (bijv. "1.000.000").
  const stapGrootte = 50;
  blokEl.querySelector('.btn-punten-min').addEventListener('click', () => {
    zetPuntenWaarde(blokEl, leesPuntenWaarde(blokEl) - stapGrootte);
  });
  blokEl.querySelector('.btn-punten-plus').addEventListener('click', () => {
    zetPuntenWaarde(blokEl, leesPuntenWaarde(blokEl) + stapGrootte);
  });
  const puntenVeld = blokEl.querySelector('.veld-punten');
  puntenVeld.addEventListener('input', () => {
    // Laat tijdens het typen alleen cijfers en punten toe.
    const schoon = puntenVeld.value.replace(/[^\d.]/g, '');
    if (schoon !== puntenVeld.value) puntenVeld.value = schoon;
  });
  puntenVeld.addEventListener('blur', () => {
    zetPuntenWaarde(blokEl, leesPuntenWaarde(blokEl));
  });

  blokEl.querySelector('.veld-aantal-antwoorden').addEventListener('change', (e) => {
    werkAantalAntwoordenZichtbaarheidBij(blokEl, parseInt(e.target.value, 10));
  });

  blokEl.querySelector('.btn-verwijder-vraag').addEventListener('click', () => {
    const aantalBlokken = vragenContainer.querySelectorAll('.vraag-blok').length;
    if (aantalBlokken <= 1) {
      document.getElementById('quizmaken-foutmelding').textContent = 'Een quiz heeft minstens 1 vraag nodig.';
      return;
    }
    blokEl.remove();
    vernummerVraagBlokken();
  });

  vragenContainer.appendChild(blokEl);
  vernummerVraagBlokken();
}

document.getElementById('btn-vraag-toevoegen').addEventListener('click', () => {
  voegVraagBlokToe();
});

// De keuze "mag alleen gespeeld worden" hoort bij het openbaar maken: pas zichtbaar
// als "Deze quiz openbaar maken" aan staat.
function werkSoloOptieZichtbaarheidBij() {
  document.getElementById('solo-optie-rij').hidden = !document.getElementById('input-openbaar').checked;
}

document.getElementById('input-openbaar').addEventListener('change', werkSoloOptieZichtbaarheidBij);

// Is deze quiz geblokkeerd door sitebeheer? Dan mag "openbaar" niet aangevinkt
// worden: het vinkje wordt uitgezet en op slot gezet, en er komt een melding.
function werkGeblokkeerdZichtbaarheidBij() {
  const openbaarCheckbox = document.getElementById('input-openbaar');
  const melding = document.getElementById('geblokkeerd-melding');
  openbaarCheckbox.disabled = huidigeBewerkGeblokkeerd;
  melding.hidden = !huidigeBewerkGeblokkeerd;
  if (huidigeBewerkGeblokkeerd) {
    openbaarCheckbox.checked = false;
  }
  werkSoloOptieZichtbaarheidBij();
}

document.getElementById('btn-toevoegen-quiz').addEventListener('click', () => {
  huidigeBewerkCode = null;
  huidigeBewerkTerugScherm = 'scherm-quizmaken';
  huidigeBewerkGeblokkeerd = false;
  document.getElementById('input-titel').value = '';
  vragenContainer.innerHTML = '';
  document.getElementById('quizmaken-foutmelding').textContent = '';
  document.getElementById('nieuwe-quiz-titel-kop').textContent = 'Nieuwe quiz';
  document.getElementById('btn-quiz-opslaan').textContent = 'Quiz opslaan';
  document.getElementById('input-openbaar').checked = false;
  document.getElementById('input-solo-toegestaan').checked = true;
  document.getElementById('input-tijdslimiet').value = String(TIJDSLIMIET_STANDAARD);
  werkGeblokkeerdZichtbaarheidBij();
  bouwOmslagGalerij(STANDAARD_OMSLAGEN[0].url);
  toonOmslagPreview(STANDAARD_OMSLAGEN[0].url);
  voegVraagBlokToe();
  toonScherm('scherm-nieuwe-quiz');
});

function startBewerkenVanQuiz(code, terugScherm) {
  db.ref('quizzen/' + code).once('value').then(snapshot => {
    const quizData = snapshot.val();
    if (!quizData) {
      alert('Deze quiz kon niet gevonden worden (misschien is hij verwijderd).');
      return;
    }

    huidigeBewerkCode = code;
    huidigeBewerkTerugScherm = terugScherm || 'scherm-quizmaken';
    huidigeBewerkGeblokkeerd = !!quizData.geblokkeerd;
    document.getElementById('input-titel').value = quizData.titel;
    vragenContainer.innerHTML = '';
    document.getElementById('quizmaken-foutmelding').textContent = '';
    document.getElementById('input-openbaar').checked = !!quizData.openbaar;
    // Oudere quizzen hebben deze keuze nog niet: die tellen als "alleen spelen mag".
    document.getElementById('input-solo-toegestaan').checked = quizData.soloToegestaan !== false;
    // Oudere quizzen hebben nog geen tijdslimiet: die vallen terug op de standaardwaarde.
    document.getElementById('input-tijdslimiet').value = String(quizData.tijdslimiet || TIJDSLIMIET_STANDAARD);
    werkGeblokkeerdZichtbaarheidBij();
    const huidigeOmslag = quizData.afbeelding || STANDAARD_OMSLAGEN[0].url;
    bouwOmslagGalerij(huidigeOmslag);
    toonOmslagPreview(huidigeOmslag);
    quizData.vragen.forEach(vraag => voegVraagBlokToe(vraag));
    document.getElementById('nieuwe-quiz-titel-kop').textContent = 'Quiz bewerken';
    document.getElementById('btn-quiz-opslaan').textContent = 'Wijzigingen opslaan';
    toonScherm('scherm-nieuwe-quiz');
  });
}

// ---------- Quiz opslaan ----------

function genereerCode() {
  const tekens = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder verwarrende tekens zoals O/0, I/1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += tekens.charAt(Math.floor(Math.random() * tekens.length));
  }
  return code;
}

document.getElementById('btn-quiz-opslaan').addEventListener('click', () => {
  const titel = document.getElementById('input-titel').value.trim();
  const foutmelding = document.getElementById('quizmaken-foutmelding');
  foutmelding.textContent = '';

  if (!titel) {
    foutmelding.textContent = 'Vul een titel in.';
    return;
  }

  const blokken = vragenContainer.querySelectorAll('.vraag-blok');
  if (blokken.length === 0) {
    foutmelding.textContent = 'Voeg minstens 1 vraag toe.';
    return;
  }

  const vragen = [];

  for (const blok of blokken) {
    const vraagTekst = blok.querySelector('.veld-vraag').value.trim();
    const aantalAntwoorden = parseInt(blok.querySelector('.veld-aantal-antwoorden').value, 10);
    const antwoordVelden = Array.from(blok.querySelectorAll('.veld-antwoord')).slice(0, aantalAntwoorden);
    const antwoorden = antwoordVelden.map(veld => veld.value.trim());
    const goedVinkjes = Array.from(blok.querySelectorAll('.veld-goed-vinkje')).slice(0, aantalAntwoorden);
    const goedAntwoorden = goedVinkjes
      .map((vinkje, i) => vinkje.checked ? i + 1 : null)
      .filter(i => i !== null);
    const punten = leesPuntenWaarde(blok);

    if (!vraagTekst || antwoorden.some(a => !a)) {
      foutmelding.textContent = 'Vul bij elke vraag de vraagtekst en alle antwoorden in.';
      return;
    }
    if (goedAntwoorden.length === 0) {
      foutmelding.textContent = 'Vink bij elke vraag minstens 1 goed antwoord aan.';
      return;
    }

    const vraagData = {
      vraag: vraagTekst,
      antwoorden: antwoorden,
      goedAntwoorden: goedAntwoorden,
      punten: punten
    };
    if (blok._afbeelding) {
      vraagData.afbeelding = blok._afbeelding;
    }
    vragen.push(vraagData);
  }

  // Een geblokkeerde quiz kan nooit openbaar opgeslagen worden, ook niet als het
  // vinkje via de browser (buiten het formulier om) toch aan zou staan.
  const isOpenbaar = huidigeBewerkGeblokkeerd ? false : document.getElementById('input-openbaar').checked;
  const soloToegestaan = document.getElementById('input-solo-toegestaan').checked;
  const tijdslimiet = parseInt(document.getElementById('input-tijdslimiet').value, 10) || TIJDSLIMIET_STANDAARD;

  if (huidigeBewerkCode) {
    // Bestaande quiz bijwerken: zelfde code, alleen titel + vragen + omslag + openbaar overschrijven.
    const code = huidigeBewerkCode;
    const terugScherm = huidigeBewerkTerugScherm;

    const updateData = { titel: titel, vragen: vragen, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar, soloToegestaan: soloToegestaan, tijdslimiet: tijdslimiet, doorBeheerVerwijderd: false, geblokkeerd: huidigeBewerkGeblokkeerd };

    // Is dit jouw eigen quiz? Dan zorgen we dat jouw naam erbij staat.
    // (Bij sitebeheer die andermans quiz aanpast blijft de naam van de maker staan.)
    const isEigenQuiz = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]').some(q => q.code === code);
    if (isEigenQuiz && huidigeMakerNaam()) {
      updateData.makerNaam = huidigeMakerNaam();
    }

    db.ref('quizzen/' + code).update(updateData)
      .then(() => {
        const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
        const bijgewerkteLijst = eigenQuizzen.map(q =>
          q.code === code ? { code: code, titel: titel, aantalVragen: vragen.length, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar } : q
        );
        localStorage.setItem('eigenQuizzen', JSON.stringify(bijgewerkteLijst));

        huidigeBewerkCode = null;
        huidigeBewerkTerugScherm = 'scherm-quizmaken';
        toonScherm(terugScherm);
        if (terugScherm === 'scherm-speelbare-quizzen') {
          laadOpenbareQuizzen();
        } else {
          laadEigenQuizzen();
        }
      })
      .catch(err => {
        foutmelding.textContent = 'Opslaan mislukt: ' + err.message;
      });
    return;
  }

  const code = genereerCode();

  const quizData = {
    titel: titel,
    vragen: vragen,
    afbeelding: geselecteerdeOmslagUrl,
    openbaar: isOpenbaar,
    soloToegestaan: soloToegestaan,
    tijdslimiet: tijdslimiet,
    geblokkeerd: false,
    makerNaam: huidigeMakerNaam() || '',
    aangemaaktOp: Date.now()
  };

  db.ref('quizzen/' + code).set(quizData)
    .then(() => {
      // Titel + code lokaal onthouden zodat "Mijn quizzen" ze kan tonen
      const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
      eigenQuizzen.push({ code: code, titel: titel, aantalVragen: vragen.length, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar });
      localStorage.setItem('eigenQuizzen', JSON.stringify(eigenQuizzen));

      document.getElementById('code-weergave').textContent = code;
      toonScherm('scherm-quiz-klaar');
    })
    .catch(err => {
      foutmelding.textContent = 'Opslaan mislukt: ' + err.message;
    });
});

document.getElementById('btn-nu-hosten').addEventListener('click', () => {
  const code = document.getElementById('code-weergave').textContent;
  startHostenVanQuiz(code);
});

// ---------- Eigen quizzen tonen (overzicht) ----------

function laadEigenQuizzen() {
  const lijstEl = document.getElementById('lijst-eigen-quizzen');

  const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');

  if (eigenQuizzen.length === 0) {
    lijstEl.innerHTML = '<p>Je hebt nog geen quiz gemaakt.</p>';
    return;
  }

  lijstEl.innerHTML = '<p>Bezig met laden...</p>';

  // Voor elke eigen quiz de actuele gegevens uit Firebase ophalen, zodat we
  // weten of de quiz nog "openbaar" is en of sitebeheer hem heeft weggehaald.
  koppelMakerNaamAanEigenQuizzen().then(() => Promise.all(
    eigenQuizzen.map(quiz =>
      db.ref('quizzen/' + quiz.code).once('value').then(snapshot => ({
        quiz: quiz,
        liveData: snapshot.val()
      }))
    )
  )).then(resultaten => {
    lijstEl.innerHTML = '';

    // Lokale lijst bijwerken als de "openbaar"-status inmiddels afwijkt
    // (bijv. omdat sitebeheer de quiz heeft weggehaald bij openbaar).
    let lijstIsGewijzigd = false;
    const bijgewerkteEigenQuizzen = eigenQuizzen.map(q => {
      const resultaat = resultaten.find(r => r.quiz.code === q.code);
      if (resultaat && resultaat.liveData && resultaat.liveData.openbaar !== q.openbaar) {
        lijstIsGewijzigd = true;
        return Object.assign({}, q, { openbaar: resultaat.liveData.openbaar });
      }
      return q;
    });
    if (lijstIsGewijzigd) {
      localStorage.setItem('eigenQuizzen', JSON.stringify(bijgewerkteEigenQuizzen));
    }

    resultaten.forEach(({ quiz, liveData }) => {
      const actueelOpenbaar = liveData ? !!liveData.openbaar : quiz.openbaar;
      const actueelGeblokkeerd = !!(liveData && liveData.geblokkeerd);
      const makerNaam = (liveData && liveData.makerNaam) || '';

      const item = document.createElement('div');
      item.className = 'quiz-item';

      if (actueelGeblokkeerd) {
        const melding = document.createElement('div');
        melding.className = 'quiz-beheer-melding quiz-beheer-melding-geblokkeerd';
        melding.textContent = '🔒 Deze quiz is geblokkeerd door sitebeheer en kan niet openbaar gezet worden.';
        item.appendChild(melding);
      }

      if (liveData && liveData.doorBeheerVerwijderd) {
        const melding = document.createElement('div');
        melding.className = 'quiz-beheer-melding';

        const meldingTekst = document.createElement('span');
        meldingTekst.textContent = 'Uw quiz is weggehaald bij openbaar.';

        const meldingSluiten = document.createElement('button');
        meldingSluiten.type = 'button';
        meldingSluiten.className = 'quiz-beheer-melding-sluiten';
        meldingSluiten.textContent = 'OK';
        meldingSluiten.addEventListener('click', () => {
          db.ref('quizzen/' + quiz.code + '/doorBeheerVerwijderd').remove()
            .then(() => melding.remove())
            .catch(err => alert('Melding weghalen mislukt: ' + err.message));
        });

        melding.appendChild(meldingTekst);
        melding.appendChild(meldingSluiten);
        item.appendChild(melding);
      }

      const afbeelding = document.createElement('img');
      afbeelding.className = 'quiz-item-afbeelding';
      afbeelding.src = quiz.afbeelding || STANDAARD_OMSLAGEN[0].url;
      afbeelding.alt = quiz.titel;

      const body = document.createElement('div');
      body.className = 'quiz-item-body';

      const info = document.createElement('div');
      info.className = 'quiz-item-info';
      info.innerHTML = `<strong>${escapeHtml(quiz.titel)}</strong><span>${quiz.aantalVragen} vraag/vragen${doorTekstVoorMaker(makerNaam)}${actueelOpenbaar ? ' · Openbaar' : ''}${actueelGeblokkeerd ? ' · Geblokkeerd' : ''}</span>`;

      const knoppen = document.createElement('div');
      knoppen.className = 'quiz-item-knoppen';

      const speelKnop = document.createElement('button');
      speelKnop.className = 'btn-spelen';
      speelKnop.textContent = 'Spelen';
      speelKnop.addEventListener('click', () => {
        // Je eigen quiz mag je altijd ook alleen spelen.
        toonSpeelKeuze(quiz.code, quiz.titel, true, 'scherm-quizmaken');
      });

      const aanpassenKnop = document.createElement('button');
      aanpassenKnop.className = 'btn-aanpassen-quiz';
      aanpassenKnop.textContent = 'Aanpassen';
      aanpassenKnop.addEventListener('click', () => {
        startBewerkenVanQuiz(quiz.code);
      });

      const verwijderKnop = document.createElement('button');
      verwijderKnop.className = 'btn-verwijderen-quiz';
      verwijderKnop.textContent = 'Verwijderen';
      verwijderKnop.addEventListener('click', () => {
        const zekerWeten = confirm('Weet je zeker dat je "' + quiz.titel + '" wilt verwijderen? Dit kan niet ongedaan gemaakt worden.');
        if (!zekerWeten) return;

        db.ref('quizzen/' + quiz.code).remove()
          .then(() => db.ref('sessies/' + quiz.code).remove())
          .then(() => {
            const bijgewerkteLijst = eigenQuizzen.filter(q => q.code !== quiz.code);
            localStorage.setItem('eigenQuizzen', JSON.stringify(bijgewerkteLijst));
            laadEigenQuizzen();
          })
          .catch(err => {
            alert('Verwijderen mislukt: ' + err.message);
          });
      });

      knoppen.appendChild(speelKnop);
      knoppen.appendChild(aanpassenKnop);
      knoppen.appendChild(verwijderKnop);

      body.appendChild(info);
      body.appendChild(knoppen);
      item.appendChild(afbeelding);
      item.appendChild(body);
      lijstEl.appendChild(item);
    });
  }).catch(err => {
    lijstEl.innerHTML = '<p>Laden van je quizzen mislukt: ' + err.message + '</p>';
  });
}

// ---------- Speelbare quizzen tonen (openbaar gemaakt door anderen) ----------

// Onthoudt of het overzicht open of ingeklapt staat (ook na opnieuw laden van de lijst).
// Staat standaard ingeklapt; wordt automatisch opengeklapt zodra je in de zoekbalk typt.
let makersOverzichtOpen = false;

// Onthoudt de laatst opgehaalde makers (zodat de zoekbalk kan filteren zonder
// steeds opnieuw bij Firebase te hoeven ophalen) en de huidige zoekterm.
let laatsteMakersLijst = [];
let makersZoekterm = '';

// Bouwt de HTML voor de rijen in het makersoverzicht, gefilterd op zoekterm
// (zoekt in de naam van de quizmaker, hoofdletterongevoelig, op elk deel van de naam).
function bouwMakersRijenHtml(makers, zoekterm) {
  if (makers.length === 0) {
    return '<p class="voortgang">Er zijn nog geen quizzen gemaakt.</p>';
  }

  const term = zoekterm.trim().toLowerCase();
  const gefilterd = term
    ? makers.filter(maker => (maker.naam || 'naam onbekend').toLowerCase().includes(term))
    : makers;

  if (gefilterd.length === 0) {
    return '<p class="sitebeheer-makers-leeg">Geen quizmakers gevonden voor "' + escapeHtml(zoekterm.trim()) + '".</p>';
  }

  return gefilterd.map(maker => {
    const aantalOpenbaar = maker.quizzen.filter(q => q.openbaar).length;
    const titels = maker.quizzen.map(q => {
      const status = q.geblokkeerd ? 'geblokkeerd' : (q.openbaar ? 'openbaar' : (q.weggehaald ? 'weggehaald' : 'niet openbaar'));
      const knopKlasse = 'btn-overzicht-blokkeren' + (q.geblokkeerd ? ' is-geblokkeerd' : '');
      const knopTekst = q.geblokkeerd ? 'Deblokkeren' : 'Blokkeren';
      const knop = '<button type="button" class="' + knopKlasse + '" data-code="' + escapeHtml(q.code) + '" data-geblokkeerd="' + (q.geblokkeerd ? '1' : '0') + '">' + knopTekst + '</button>';
      return '<li>' + escapeHtml(q.titel) + ' <span class="sitebeheer-maker-code">' + escapeHtml(q.code) + ' · ' + status + '</span>' + knop + '</li>';
    }).join('');
    return '<div class="sitebeheer-maker-rij">' +
      '<div class="sitebeheer-maker-naam-rij">' +
      '<strong>' + (maker.naam ? escapeHtml(maker.naam) : 'Naam onbekend') + '</strong>' +
      '<button type="button" class="btn-overzicht-naam-wijzigen" data-naam="' + escapeHtml(maker.naam) +
      '" data-codes="' + maker.quizzen.map(q => escapeHtml(q.code)).join(',') + '">Naam wijzigen</button>' +
      '<span class="sitebeheer-maker-telling">' + maker.quizzen.length + ' quiz/quizzen · ' + aantalOpenbaar + ' openbaar</span>' +
      '</div>' +
      '<ul>' + titels + '</ul>' +
      '</div>';
  }).join('');
}

// Alleen voor sitebeheer: overzicht van ALLE quizmakers (dus ook van quizzen
// die niet openbaar zijn of door sitebeheer bij openbaar zijn weggehaald).
function toonSitebeheerMakersOverzicht() {
  const lijstEl = document.getElementById('lijst-openbare-quizzen');
  let overzichtEl = document.getElementById('sitebeheer-makers-overzicht');

  if (!sitebeheerActief) {
    if (overzichtEl) overzichtEl.remove();
    return;
  }

  if (!overzichtEl) {
    overzichtEl = document.createElement('div');
    overzichtEl.id = 'sitebeheer-makers-overzicht';
    overzichtEl.className = 'sitebeheer-makers';
    lijstEl.parentNode.insertBefore(overzichtEl, lijstEl);

    // Eén keer een klik-listener voor de blokkeer/deblokkeer-knopjes: dit overzicht
    // toont ALLE quizzen (ook niet-openbare), dus hier kan sitebeheer élke quiz
    // blokkeren, niet alleen quizzen die nu in "Speelbare quizzen" staan.
    overzichtEl.addEventListener('click', (e) => {
      const blokkeerKnop = e.target.closest('.btn-overzicht-blokkeren');
      if (blokkeerKnop) {
        const code = blokkeerKnop.dataset.code;
        const isNuGeblokkeerd = blokkeerKnop.dataset.geblokkeerd === '1';
        const bevestiging = isNuGeblokkeerd
          ? 'Weet je zeker dat je deze quiz wilt deblokkeren? De maker kan hem daarna weer openbaar zetten.'
          : 'Weet je zeker dat je deze quiz wilt blokkeren? Hij gaat direct offline (als hij openbaar stond) en kan niet meer openbaar gezet worden totdat je hem weer deblokkeert.';
        if (!confirm(bevestiging)) return;

        const updateData = isNuGeblokkeerd
          ? { geblokkeerd: false }
          : { geblokkeerd: true, openbaar: false };

        db.ref('quizzen/' + code).update(updateData)
          .then(() => {
            laadOpenbareQuizzen();
          })
          .catch(err => {
            alert('Bijwerken mislukt: ' + err.message);
          });
        return;
      }

      const naamKnop = e.target.closest('.btn-overzicht-naam-wijzigen');
      if (naamKnop) {
        const codes = (naamKnop.dataset.codes || '').split(',').filter(Boolean);
        if (codes.length === 0) return;
        const huidigeNaam = naamKnop.dataset.naam || '';

        const nieuweNaam = prompt(
          'Nieuwe naam voor deze quizmaker (geldt voor al ' + (codes.length === 1 ? 'zijn/haar quiz' : 'zijn/haar ' + codes.length + ' quizzen') + '):',
          huidigeNaam
        );
        if (nieuweNaam === null) return; // geannuleerd
        const schoneNaam = nieuweNaam.trim();
        if (!schoneNaam) {
          alert('Vul een naam in.');
          return;
        }
        if (schoneNaam === huidigeNaam) return; // niets veranderd

        // Eén update met alle quizzen van deze maker tegelijk (voorkomt dat de
        // groep halverwege in twee stukken uiteenvalt als één update mislukt).
        const updates = {};
        codes.forEach(code => {
          updates[code + '/makerNaam'] = schoneNaam;
        });

        naamKnop.disabled = true;
        db.ref('quizzen').update(updates)
          .then(() => {
            laadOpenbareQuizzen();
          })
          .catch(err => {
            alert('Naam wijzigen mislukt: ' + err.message);
            naamKnop.disabled = false;
          });
        return;
      }
    });

    // Eén keer een input-listener voor de zoekbalk: filtert alleen de rijen
    // (niet de hele overzicht-HTML), zodat de zoekbalk niet zijn focus verliest
    // terwijl je typt. Klapt het venster ook automatisch open zodra je typt.
    overzichtEl.addEventListener('input', (e) => {
      if (e.target.id !== 'input-zoek-makers') return;
      makersZoekterm = e.target.value;
      const rijenEl = overzichtEl.querySelector('#sitebeheer-makers-rijen');
      if (rijenEl) rijenEl.innerHTML = bouwMakersRijenHtml(laatsteMakersLijst, makersZoekterm);
      const detailsEl = overzichtEl.querySelector('details');
      if (detailsEl && makersZoekterm.trim()) {
        detailsEl.open = true;
        makersOverzichtOpen = true;
      }
    });
  }
  overzichtEl.innerHTML = '<p class="voortgang">Quizmakers laden...</p>';

  db.ref('quizzen').once('value')
    .then(snapshot => {
      if (!sitebeheerActief) {
        overzichtEl.remove();
        return;
      }

      const data = snapshot.val() || {};
      const groepen = {};

      Object.entries(data).forEach(([code, quiz]) => {
        const naam = ((quiz && quiz.makerNaam) || '').trim();
        const sleutel = naam.toLowerCase(); // 'Sam' en 'sam' tellen als dezelfde maker
        if (!groepen[sleutel]) {
          groepen[sleutel] = { naam: naam, quizzen: [] };
        }
        groepen[sleutel].quizzen.push({
          code: code,
          titel: (quiz && quiz.titel) || '(zonder titel)',
          openbaar: !!(quiz && quiz.openbaar),
          weggehaald: !!(quiz && quiz.doorBeheerVerwijderd),
          geblokkeerd: !!(quiz && quiz.geblokkeerd)
        });
      });

      const makers = Object.values(groepen).sort((a, b) => {
        if (!a.naam) return 1;   // "naam onbekend" altijd onderaan
        if (!b.naam) return -1;
        return a.naam.localeCompare(b.naam, 'nl');
      });

      laatsteMakersLijst = makers;

      // <details> = inklapbaar venster (staat standaard ingeklapt); klik op de
      // titel om in of uit te klappen. De zoekbalk staat erboven, buiten het
      // inklapbare venster, zodat je ook kunt zoeken terwijl het dicht staat
      // (typen klapt het vanzelf open).
      overzichtEl.innerHTML =
        '<div class="sitebeheer-makers-zoek">' +
        '<input type="text" id="input-zoek-makers" placeholder="🔍 Zoek op naam..." value="' + escapeHtml(makersZoekterm) + '">' +
        '</div>' +
        '<details class="sitebeheer-makers-details"' + (makersOverzichtOpen ? ' open' : '') + '>' +
        '<summary>Alle quizmakers (' + makers.length + ')</summary>' +
        '<div id="sitebeheer-makers-rijen">' + bouwMakersRijenHtml(makers, makersZoekterm) + '</div>' +
        '</details>';

      const detailsEl = overzichtEl.querySelector('details');
      detailsEl.addEventListener('toggle', () => {
        makersOverzichtOpen = detailsEl.open;
      });
    })
    .catch(err => {
      overzichtEl.innerHTML = '<p class="foutmelding">Laden van quizmakers mislukt: ' + escapeHtml(err.message) + '</p>';
    });
}

// Onthoudt de laatst opgehaalde openbare quizzen (zodat de zoekbalk kan
// filteren zonder steeds opnieuw bij Firebase te hoeven ophalen).
let laatsteOpenbareQuizzenData = []; // [[code, quiz], ...]

// Bouwt één quiz-kaartje op voor "Speelbare quizzen". Gebruikt door
// renderOpenbareQuizzenLijst voor elke quiz die (na filteren) getoond wordt.
function bouwOpenbareQuizItemEl(code, quiz) {
        const item = document.createElement('div');
        item.className = 'quiz-item';

        const afbeelding = document.createElement('img');
        afbeelding.className = 'quiz-item-afbeelding';
        afbeelding.src = quiz.afbeelding || STANDAARD_OMSLAGEN[0].url;
        afbeelding.alt = quiz.titel;

        const body = document.createElement('div');
        body.className = 'quiz-item-body';

        const info = document.createElement('div');
        info.className = 'quiz-item-info';
        const aantalVragen = (quiz.vragen || []).length;
        const makerNaam = quiz.makerNaam || '';
        const doorTekst = doorTekstVoorMaker(makerNaam);
        const codeTekst = sitebeheerActief ? ' · Code ' + escapeHtml(code) : '';
        info.innerHTML = `<strong>${escapeHtml(quiz.titel)}</strong><span>${aantalVragen} vraag/vragen${doorTekst}${codeTekst}</span>`;

        const knoppen = document.createElement('div');
        knoppen.className = 'quiz-item-knoppen';

        const speelKnop = document.createElement('button');
        speelKnop.className = 'btn-spelen';
        speelKnop.textContent = 'Spelen';
        speelKnop.addEventListener('click', () => {
          // Alleen spelen mag als de maker dat heeft toegestaan (of als het je eigen quiz is).
          const soloMag = quiz.soloToegestaan !== false || isEigenQuizCode(code);
          toonSpeelKeuze(code, quiz.titel, soloMag, 'scherm-speelbare-quizzen');
        });

        knoppen.appendChild(speelKnop);

        if (sitebeheerActief) {
          const aanpassenKnop = document.createElement('button');
          aanpassenKnop.className = 'btn-aanpassen-quiz';
          aanpassenKnop.textContent = 'Aanpassen';
          aanpassenKnop.addEventListener('click', () => {
            startBewerkenVanQuiz(code, 'scherm-speelbare-quizzen');
          });
          knoppen.appendChild(aanpassenKnop);

          const blokkeerKnop = document.createElement('button');
          blokkeerKnop.className = 'btn-blokkeren-quiz';
          blokkeerKnop.textContent = 'Blokkeren';
          blokkeerKnop.addEventListener('click', () => {
            const zekerWeten = confirm('Weet je zeker dat je "' + quiz.titel + '" wilt blokkeren? De quiz gaat direct offline en de maker kan hem niet meer openbaar zetten totdat je hem weer deblokkeert.');
            if (!zekerWeten) return;

            db.ref('quizzen/' + code).update({ openbaar: false, geblokkeerd: true })
              .then(() => {
                laadOpenbareQuizzen();
              })
              .catch(err => {
                alert('Blokkeren mislukt: ' + err.message);
              });
          });
          knoppen.appendChild(blokkeerKnop);

          const verwijderKnop = document.createElement('button');
          verwijderKnop.className = 'btn-verwijderen-quiz';
          verwijderKnop.textContent = 'Verwijderen';
          verwijderKnop.addEventListener('click', () => {
            const zekerWeten = confirm('Weet je zeker dat je "' + quiz.titel + '" wilt verwijderen uit Speelbare quizzen? De quiz zelf blijft bestaan voor de maker, hij verdwijnt alleen uit deze lijst.');
            if (!zekerWeten) return;

            db.ref('quizzen/' + code).update({ openbaar: false, doorBeheerVerwijderd: true })
              .then(() => {
                laadOpenbareQuizzen();
              })
              .catch(err => {
                alert('Verwijderen mislukt: ' + err.message);
              });
          });
          knoppen.appendChild(verwijderKnop);
        }

  body.appendChild(info);
  body.appendChild(knoppen);
  item.appendChild(afbeelding);
  item.appendChild(body);
  return item;
}

// Toont de huidige "laatsteOpenbareQuizzenData", gefilterd op de zoekbalk
// (zoekt op titel, hoofdletterongevoelig, op elk deel van de titel).
// Wordt aangeroepen na elke keer laden én bij elke toetsaanslag in de zoekbalk.
function renderOpenbareQuizzenLijst() {
  const lijstEl = document.getElementById('lijst-openbare-quizzen');
  const zoekVeldEl = document.getElementById('input-zoek-speelbare-quizzen');
  const zoekterm = ((zoekVeldEl && zoekVeldEl.value) || '').trim().toLowerCase();

  lijstEl.innerHTML = '';

  if (laatsteOpenbareQuizzenData.length === 0) {
    lijstEl.innerHTML = '<p>Er zijn nog geen openbare quizzen. Zet je eigen quiz op openbaar om hem hier te laten verschijnen.</p>';
    return;
  }

  const gefilterd = zoekterm
    ? laatsteOpenbareQuizzenData.filter(([, quiz]) => (quiz.titel || '').toLowerCase().includes(zoekterm))
    : laatsteOpenbareQuizzenData;

  if (gefilterd.length === 0) {
    lijstEl.innerHTML = '<p>Geen quizzen gevonden voor "' + escapeHtml((zoekVeldEl && zoekVeldEl.value.trim()) || '') + '".</p>';
    return;
  }

  gefilterd.forEach(([code, quiz]) => {
    lijstEl.appendChild(bouwOpenbareQuizItemEl(code, quiz));
  });
}

function laadOpenbareQuizzen() {
  const lijstEl = document.getElementById('lijst-openbare-quizzen');
  lijstEl.innerHTML = '<p>Bezig met laden...</p>';
  toonSitebeheerMakersOverzicht();

  koppelMakerNaamAanEigenQuizzen()
    .then(() => db.ref('quizzen').orderByChild('openbaar').equalTo(true).once('value'))
    .then(snapshot => {
      const data = snapshot.val();
      laatsteOpenbareQuizzenData = data ? Object.entries(data) : [];
      renderOpenbareQuizzenLijst();
    })
    .catch(err => {
      lijstEl.innerHTML = '<p>Laden van openbare quizzen mislukt: ' + err.message + '</p>';
    });
}

// Live filteren terwijl je typt (zoekt op titel, zowel als gewone bezoeker
// als sitebeheer — de zoekbalk staat altijd boven "Speelbare quizzen").
const inputZoekSpeelbareQuizzenEl = document.getElementById('input-zoek-speelbare-quizzen');
if (inputZoekSpeelbareQuizzenEl) {
  inputZoekSpeelbareQuizzenEl.addEventListener('input', renderOpenbareQuizzenLijst);
}

// ================================================================
//  LIVE QUIZ: hosten, meedoen, spelen en scorebord
// ================================================================
//
// Structuur in Firebase:
//   quizzen/<code>            -> titel, vragen, aangemaaktOp  (al bestond)
//   sessies/<code>            -> status, huidigeVraagIndex, spelers, antwoorden
//     status: 'wachtkamer' | 'vraag' | 'resultaat' | 'scorebord' | 'afgelopen'
//       vraag     -> spelers antwoorden (daarna zien ze alleen een groot laadteken)
//       resultaat -> host: het goede antwoord + hoeveel spelers het goed hadden;
//                    spelers: goed/fout met het goede antwoord eronder
//                    (punten worden op dit moment geteld)
//       scorebord -> alleen het scorebord, zonder vraag en antwoord
//     spelers/<spelerId>      -> naam, dier (emoji), accessoires (boven/gezicht/hoek), score, totaleReactietijd
//     antwoorden/<vraagIndex>/<spelerId> -> antwoordIndexen (lijst), reactietijdMs
//
// Een vraag kan 2 of 4 antwoorden hebben en 1 of meerdere daarvan kunnen goed
// zijn (zie goedAntwoorden in normaliseerVraag hierboven). Een speler moet
// precies de goede antwoorden aanvinken (niet meer, niet minder) om de vraag
// goed te hebben.
//
// Puntentelling: een goed antwoord levert 1000 punten op. Bij een gelijke
// stand wint degene die (opgeteld over de vragen) het snelst klikte.

let huidigeSessieRef = null;
let huidigeRol = null; // 'host' of 'speler'
let huidigeSessieCode = null;
let huidigeQuizVragen = [];
let huidigeQuizTitel = '';
let huidigeQuizTijdslimiet = TIJDSLIMIET_STANDAARD;
let huidigeVraagIndexHost = -1;
let huidigeSpelerId = null;

// Wekker per vraag (alleen zichtbaar bij de quizmaster tijdens live hosten).
// Loopt de tijd af, dan gaat de host automatisch door naar het resultaat
// (hetzelfde als zelf op "Doorgaan" klikken).
let hostTimerInterval = null;
let hostTimerVoorVraagGestartOp = null;
let resultaatWordtBerekend = false;

let laatstGetoondeVraagIndexSpeler = -1;
let vraagGetoondOpSpeler = 0;
let spelerHeeftGeantwoord = false;
let spelerGeselecteerdeAntwoorden = [];
let huidigeStatusSpeler = '';
let muntenToegekendVoorSessie = null; // sessiecode waarvoor deze speler al munten voor winnen kreeg (voorkomt dubbel toekennen)

// ---------- Poppetje: een dier + accessoires (hoeden, brillen, hartjes, ...) ----------
// De tekeningen zelf (dieren, hoeden, brillen, ...) staan in poppetjes.js. Dat bestand
// levert DIEREN, ACCESSOIRE_GROEPEN, geldigeAccessoires() en poppetjeSvg().

let kiezerTab = 'dieren'; // 'dieren' of 'accessoires' (welk tabblad open staat in de wachtkamer)
let huidigePoppetje = { dier: '', accessoires: {} }; // wat deze speler nu heeft gekozen

function willekeurigDier() {
  const bezit = haalBezitDieren();
  return bezit[Math.floor(Math.random() * bezit.length)];
}

// Geeft het dier terug als het een geldig dier uit de lijst is, anders ''.
function geldigDier(dier) {
  return DIEREN.indexOf(dier) !== -1 ? dier : '';
}

// Maakt het poppetje: het getekende dier met de accessoires er passend op.
// De grootte volgt de lettergrootte van het element waar hij in komt te staan.
function maakPoppetje(dier, accessoires) {
  const poppetje = document.createElement('span');
  poppetje.className = 'poppetje';
  poppetje.innerHTML = poppetjeSvg(geldigDier(dier), accessoires);
  return poppetje;
}

// Bouwt de knoppen in de wachtkamer, afhankelijk van het open tabblad.
function bouwKiezer() {
  const kiezerEl = document.getElementById('dieren-kiezer');
  kiezerEl.innerHTML = '';

  const opDieren = kiezerTab === 'dieren';
  kiezerEl.classList.toggle('accessoires', !opDieren);
  document.getElementById('tab-dieren').classList.toggle('actief', opDieren);
  document.getElementById('tab-dieren').setAttribute('aria-selected', String(opDieren));
  document.getElementById('tab-accessoires').classList.toggle('actief', !opDieren);
  document.getElementById('tab-accessoires').setAttribute('aria-selected', String(!opDieren));

  const bezitDieren = haalBezitDieren();
  const bezitAccessoires = haalBezitAccessoires();
  const totaalDierenCatalogus = DIEREN.length;
  const totaalAccCatalogus = ACCESSOIRE_GROEPEN.reduce((n, g) => n + g.items.length, 0);

  if (opDieren) {
    bezitDieren.forEach(dier => {
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'dier-knop';
      knop.innerHTML = poppetjeSvg(dier, {});
      knop.dataset.dier = dier;
      knop.setAttribute('aria-label', 'Kies ' + dier);
      knop.addEventListener('click', () => kiesDier(dier));
      kiezerEl.appendChild(knop);
    });
  } else {
    // Bij elk accessoire zie je meteen hoe het op jouw dier staat.
    const voorbeeldDier = huidigePoppetje.dier || bezitDieren[0];
    ACCESSOIRE_GROEPEN.forEach(groep => {
      const items = groep.items.filter(emoji => bezitAccessoires.indexOf(emoji) !== -1);
      if (!items.length) return; // deze hele groep nog niet in bezit

      const kop = document.createElement('div');
      kop.className = 'kiezer-groep-titel';
      kop.textContent = groep.titel;
      kiezerEl.appendChild(kop);

      items.forEach(emoji => {
        const voorbeeld = {};
        voorbeeld[groep.plek] = emoji;
        const knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'dier-knop';
        knop.innerHTML = poppetjeSvg(voorbeeldDier, voorbeeld);
        knop.dataset.plek = groep.plek;
        knop.dataset.acc = emoji;
        knop.setAttribute('aria-label', 'Kies ' + ACCESSOIRES[emoji].naam);
        knop.addEventListener('click', () => kiesAccessoire(groep.plek, emoji));
        kiezerEl.appendChild(knop);
      });
    });

    const wegKnop = document.createElement('button');
    wegKnop.type = 'button';
    wegKnop.className = 'kiezer-weg-knop';
    wegKnop.textContent = 'Alle accessoires weghalen';
    wegKnop.addEventListener('click', verwijderAlleAccessoires);
    kiezerEl.appendChild(wegKnop);
  }

  if (bezitDieren.length < totaalDierenCatalogus || bezitAccessoires.length < totaalAccCatalogus) {
    const hint = document.createElement('p');
    hint.className = 'kiezer-hint';
    hint.textContent = '🎁 Meer dieren en accessoires vind je in de winkel (mysterieboxen)!';
    kiezerEl.appendChild(hint);
  }

  toonGekozenPoppetje(huidigePoppetje);
}

document.getElementById('tab-dieren').addEventListener('click', () => {
  kiezerTab = 'dieren';
  bouwKiezer();
});
document.getElementById('tab-accessoires').addEventListener('click', () => {
  kiezerTab = 'accessoires';
  bouwKiezer();
});

// ---------- Dierenverzameling: de hele catalogus bekijken, ook buiten een quiz om ----------
// Dit scherm laat zowel de dieren/accessoires zien die je al hebt, als de rest van de
// catalogus (grijs met een slotje), zodat je ook zonder in een quiz te zitten kunt zien
// welke poppetjes er allemaal bestaan. Klik je op iets dat je al hebt, dan verkoop je het
// (na een bevestigingsvraag) voor VERKOOP_PRIJS munten; grijze (nog niet in bezit) knoppen
// doen niks.

let kiezerTabVerzameling = 'dieren'; // 'dieren' of 'accessoires'
const VERKOOP_PRIJS = 5;

document.getElementById('tab-verzameling-dieren').addEventListener('click', () => {
  kiezerTabVerzameling = 'dieren';
  bouwVerzamelingKiezer();
});
document.getElementById('tab-verzameling-accessoires').addEventListener('click', () => {
  kiezerTabVerzameling = 'accessoires';
  bouwVerzamelingKiezer();
});

// Verkoopt een dier uit je bezit. Je laatste dier mag je niet verkopen: haalBezitDieren()
// valt anders terug op de gratis standaarddieren zodra je bezit leeg is, en dan zou je
// oneindig munten kunnen "verdienen" door steeds hetzelfde teruggekregen dier te verkopen.
function verkoopDier(dier) {
  const bezit = haalBezitDieren();
  const index = bezit.indexOf(dier);
  if (index === -1) return;
  if (bezit.length <= 1) {
    alert('Je kunt je laatste dier niet verkopen.');
    return;
  }
  if (!confirm('Dit dier verkopen voor ' + VERKOOP_PRIJS + ' munten? Je bent hem dan kwijt.')) return;

  bezit.splice(index, 1);
  localStorage.setItem(BEZIT_DIEREN_SLEUTEL, JSON.stringify(bezit));
  geefMunten(VERKOOP_PRIJS);
  bouwVerzamelingKiezer();
}

// Zelfde idee als verkoopDier(), maar dan voor een accessoire.
function verkoopAccessoire(emoji) {
  const bezit = haalBezitAccessoires();
  const index = bezit.indexOf(emoji);
  if (index === -1) return;
  if (bezit.length <= 1) {
    alert('Je kunt je laatste accessoire niet verkopen.');
    return;
  }
  const naam = (ACCESSOIRES[emoji] && ACCESSOIRES[emoji].naam) || 'dit accessoire';
  if (!confirm('"' + naam + '" verkopen voor ' + VERKOOP_PRIJS + ' munten? Je bent het dan kwijt.')) return;

  bezit.splice(index, 1);
  localStorage.setItem(BEZIT_ACCESSOIRES_SLEUTEL, JSON.stringify(bezit));
  geefMunten(VERKOOP_PRIJS);
  bouwVerzamelingKiezer();
}

function bouwVerzamelingKiezer() {
  const kiezerEl = document.getElementById('verzameling-kiezer');
  kiezerEl.innerHTML = '';

  const opDieren = kiezerTabVerzameling === 'dieren';
  kiezerEl.classList.toggle('accessoires', !opDieren);
  document.getElementById('tab-verzameling-dieren').classList.toggle('actief', opDieren);
  document.getElementById('tab-verzameling-dieren').setAttribute('aria-selected', String(opDieren));
  document.getElementById('tab-verzameling-accessoires').classList.toggle('actief', !opDieren);
  document.getElementById('tab-verzameling-accessoires').setAttribute('aria-selected', String(!opDieren));

  const bezitDieren = haalBezitDieren();
  const bezitAccessoires = haalBezitAccessoires();
  const voorbeeldDier = bezitDieren[0] || DIEREN[0];

  const telling = document.createElement('p');
  telling.className = 'verzameling-telling';
  kiezerEl.appendChild(telling);

  if (opDieren) {
    telling.textContent = bezitDieren.length + ' van de ' + DIEREN.length + ' dieren in bezit';

    DIEREN.forEach(dier => {
      const inBezit = bezitDieren.indexOf(dier) !== -1;
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'dier-knop' + (inBezit ? '' : ' niet-bezit');
      knop.innerHTML = poppetjeSvg(dier, {});
      if (inBezit) {
        knop.setAttribute('aria-label', 'Verkoop dit dier voor ' + VERKOOP_PRIJS + ' munten');
        knop.title = 'Verkopen voor ' + VERKOOP_PRIJS + ' munten';
        knop.addEventListener('click', () => verkoopDier(dier));
      } else {
        knop.disabled = true;
        knop.setAttribute('aria-label', 'Nog niet in bezit');
      }
      kiezerEl.appendChild(knop);
    });
  } else {
    const totaalAccessoires = ACCESSOIRE_GROEPEN.reduce((n, g) => n + g.items.length, 0);
    telling.textContent = bezitAccessoires.length + ' van de ' + totaalAccessoires + ' accessoires in bezit';

    ACCESSOIRE_GROEPEN.forEach(groep => {
      const kop = document.createElement('div');
      kop.className = 'kiezer-groep-titel';
      kop.textContent = groep.titel;
      kiezerEl.appendChild(kop);

      groep.items.forEach(emoji => {
        const inBezit = bezitAccessoires.indexOf(emoji) !== -1;
        const voorbeeld = {};
        voorbeeld[groep.plek] = emoji;
        const naam = (ACCESSOIRES[emoji] && ACCESSOIRES[emoji].naam) || 'Nog niet in bezit';
        const knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'dier-knop' + (inBezit ? '' : ' niet-bezit');
        knop.innerHTML = poppetjeSvg(voorbeeldDier, voorbeeld);
        if (inBezit) {
          knop.setAttribute('aria-label', 'Verkoop ' + naam + ' voor ' + VERKOOP_PRIJS + ' munten');
          knop.title = 'Verkopen voor ' + VERKOOP_PRIJS + ' munten';
          knop.addEventListener('click', () => verkoopAccessoire(emoji));
        } else {
          knop.disabled = true;
          knop.setAttribute('aria-label', 'Nog niet in bezit');
        }
        kiezerEl.appendChild(knop);
      });
    });
  }

  const hint = document.createElement('p');
  hint.className = 'kiezer-hint';
  hint.textContent = '🎁 Grijze diertjes en accessoires met een slotje vind je (met een beetje geluk) in de winkel! Klik op iets dat je al hebt om het voor ' + VERKOOP_PRIJS + ' munten te verkopen.';
  kiezerEl.appendChild(hint);
}

// Toont het gekozen poppetje groot boven de tekst en markeert de gekozen knoppen.
// `speler` is het speler-object uit de sessie (met dier en accessoires).
function toonGekozenPoppetje(speler) {
  speler = speler || {};
  const dier = geldigDier(speler.dier);
  const acc = geldigeAccessoires(speler.accessoires);
  huidigePoppetje = { dier: dier, accessoires: acc };

  const grootEl = document.getElementById('speler-wachtkamer-dier');
  grootEl.innerHTML = '';
  if (dier) grootEl.appendChild(maakPoppetje(dier, acc));

  document.querySelectorAll('#dieren-kiezer .dier-knop').forEach(knop => {
    if (knop.dataset.dier) {
      knop.classList.toggle('gekozen', knop.dataset.dier === dier);
    } else if (knop.dataset.acc) {
      knop.classList.toggle('gekozen', acc[knop.dataset.plek] === knop.dataset.acc);
    }
  });
}

// Mag deze speler nu nog iets aan zijn poppetje veranderen?
// Alleen in de wachtkamer (en alleen als je nog meedoet), anders zou een
// verwijderde speler per ongeluk weer verschijnen.
function magPoppetjeWijzigen() {
  return huidigeRol === 'speler' && huidigeStatusSpeler === 'wachtkamer' &&
    !!huidigeSessieCode && !!huidigeSpelerId;
}

function spelerRef() {
  return db.ref('sessies/' + huidigeSessieCode + '/spelers/' + huidigeSpelerId);
}

// De speler kiest een dier: opslaan bij de speler in de sessie.
function kiesDier(dier) {
  if (!magPoppetjeWijzigen() || !geldigDier(dier) || haalBezitDieren().indexOf(dier) === -1) return;

  toonGekozenPoppetje({ dier: dier, accessoires: huidigePoppetje.accessoires });
  spelerRef().child('dier').set(dier);
}

// De speler kiest een accessoire. Nog eens op hetzelfde tikken haalt het weer weg.
function kiesAccessoire(plek, emoji) {
  if (!magPoppetjeWijzigen()) return;
  const groep = ACCESSOIRE_GROEPEN.find(g => g.plek === plek);
  if (!groep || groep.items.indexOf(emoji) === -1 || haalBezitAccessoires().indexOf(emoji) === -1) return;

  const acc = Object.assign({}, huidigePoppetje.accessoires);
  const ref = spelerRef().child('accessoires').child(plek);
  if (acc[plek] === emoji) {
    delete acc[plek];
    ref.remove();
  } else {
    acc[plek] = emoji;
    ref.set(emoji);
  }
  toonGekozenPoppetje({ dier: huidigePoppetje.dier, accessoires: acc });
}

function verwijderAlleAccessoires() {
  if (!magPoppetjeWijzigen()) return;
  toonGekozenPoppetje({ dier: huidigePoppetje.dier, accessoires: {} });
  spelerRef().child('accessoires').remove();
}

// ================================================================
//  MUNTEN EN MYSTERIEBOXEN (winkel)
// ================================================================
//
// Er zijn geen echte accounts voor gewone spelers, dus net als de naam
// (zie hierboven) worden munten en "bezit" (welke dieren/accessoires je
// hebt) lokaal onthouden per browser/apparaat (localStorage). Iedereen
// begint gratis met de hond, de kat en de zonnebril (STANDAARD_DIEREN /
// STANDAARD_ACCESSOIRES in poppetjes.js). De rest zit verstopt in
// mysterieboxen die sitebeheer ontwerpt (naam, prijs, inhoud) en die je met
// munten koopt in de Winkel; alles wat erin zit krijg en houd je voorgoed.
// Munten verdien je bij een live quiz ("Met mensen") met een top 3-plek
// (1e: 30, 2e: 20, 3e: 10) of door alleen een quiz helemaal goed te spelen (30). Boxen staan in Firebase onder "mysterieboxen" — zie readme.md
// voor de bijbehorende regel die daar nog voor toegevoegd moet worden.

const MUNTEN_SLEUTEL = 'quizAppMunten';
const BEZIT_DIEREN_SLEUTEL = 'quizAppBezitDieren';
const BEZIT_ACCESSOIRES_SLEUTEL = 'quizAppBezitAccessoires';
// Welke mysterieboxen (op id) deze speler ooit heeft gekocht — lokaal onthouden, zodat
// we in de winkel kunnen laten zien "✅ Al eerder gekocht" en iemand niet per ongeluk
// nog een keer munten uitgeeft aan een box die hij al heeft.
const GEKOCHTE_BOXEN_SLEUTEL = 'quizAppGekochteBoxen';
// Munten bij een live quiz ("Met mensen"): 1e, 2e en 3e plek. De rest krijgt niets.
const MUNTEN_LIVE_PER_PLEK = [30, 20, 10];
// Munten als je alleen speelt ("Zonder mensen") en alles goed hebt.
const MUNTEN_SOLO_ALLES_GOED = 5;

function haalMunten() {
  return parseInt(localStorage.getItem(MUNTEN_SLEUTEL) || '0', 10) || 0;
}

// Werkt overal op de pagina de weergegeven munten bij (klasse "munten-aantal").
function werkMuntenWeergaveBij() {
  const aantal = haalMunten();
  document.querySelectorAll('.munten-aantal').forEach(el => { el.textContent = String(aantal); });
}

function zetMunten(nieuwAantal) {
  localStorage.setItem(MUNTEN_SLEUTEL, String(Math.max(0, nieuwAantal)));
  werkMuntenWeergaveBij();
}

function geefMunten(aantal) {
  zetMunten(haalMunten() + aantal);
}

function haalBezitDieren() {
  const opgeslagen = JSON.parse(localStorage.getItem(BEZIT_DIEREN_SLEUTEL) || 'null');
  return Array.isArray(opgeslagen) && opgeslagen.length ? opgeslagen : STANDAARD_DIEREN.slice();
}

function haalBezitAccessoires() {
  const opgeslagen = JSON.parse(localStorage.getItem(BEZIT_ACCESSOIRES_SLEUTEL) || 'null');
  return Array.isArray(opgeslagen) && opgeslagen.length ? opgeslagen : STANDAARD_ACCESSOIRES.slice();
}

// Laatst opgehaalde volledige lijst mysterieboxen (ongefilterd), gebruikt om in het
// bewerkformulier te kunnen tonen in hoeveel andere kisten een dier/accessoire al zit.
let alleMysterieboxenCache = {};

// Datum (YYYY-MM-DD) van vandaag, voor vergelijking met box.vanafDatum. Puur op datumtekst
// vergelijken voorkomt gedoe met tijdzones/uren.
function huidigeDatumTekst() {
  const nu = new Date();
  return nu.getFullYear() + '-' + String(nu.getMonth() + 1).padStart(2, '0') + '-' + String(nu.getDate()).padStart(2, '0');
}

// Is deze kist nog niet te koop omdat de ingestelde "vanaf"-datum in de toekomst ligt?
function boxIsNogNietTeKoop(box) {
  return !!(box && box.vanafDatum && box.vanafDatum > huidigeDatumTekst());
}

// Is deze kist automatisch offline gegaan omdat de ingestelde "offline vanaf"-datum
// al bereikt of gepasseerd is?
function boxIsAutomatischOffline(box) {
  return !!(box && box.totDatum && box.totDatum <= huidigeDatumTekst());
}

// Nette weergave van een YYYY-MM-DD datum, bijv. "5 oktober 2026".
function formatBoxDatum(datumTekst) {
  if (!datumTekst) return '';
  const datum = new Date(datumTekst + 'T00:00:00');
  if (isNaN(datum.getTime())) return datumTekst;
  return datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function haalGekochteBoxen() {
  const opgeslagen = JSON.parse(localStorage.getItem(GEKOCHTE_BOXEN_SLEUTEL) || 'null');
  return Array.isArray(opgeslagen) ? opgeslagen : [];
}

function voegGekochteBoxToe(boxId) {
  const gekocht = haalGekochteBoxen();
  if (gekocht.indexOf(boxId) === -1) {
    gekocht.push(boxId);
    localStorage.setItem(GEKOCHTE_BOXEN_SLEUTEL, JSON.stringify(gekocht));
  }
}

// Voegt de inhoud van een gekochte box toe aan wat de speler al heeft (geen dubbelen).
function voegBezitToe(dieren, accessoires) {
  const huidigeDieren = haalBezitDieren();
  const huidigeAccessoires = haalBezitAccessoires();
  (dieren || []).forEach(d => { if (DIEREN.indexOf(d) !== -1 && huidigeDieren.indexOf(d) === -1) huidigeDieren.push(d); });
  (accessoires || []).forEach(a => { if (ACCESSOIRES[a] && huidigeAccessoires.indexOf(a) === -1) huidigeAccessoires.push(a); });
  localStorage.setItem(BEZIT_DIEREN_SLEUTEL, JSON.stringify(huidigeDieren));
  localStorage.setItem(BEZIT_ACCESSOIRES_SLEUTEL, JSON.stringify(huidigeAccessoires));
}

document.getElementById('btn-naar-winkel').addEventListener('click', () => {
  metProfielVereist(() => {
    toonScherm('scherm-winkel');
    laadWinkelBoxen();
  });
});

document.getElementById('btn-naar-wiel').addEventListener('click', () => {
  metProfielVereist(() => {
    toonScherm('scherm-wiel');
    laadGeluksrad();
  });
});

// ---------- Mysterieboxen laden en tonen ----------

function bouwBoxKaartHtml(boxId, box) {
  const aantalItems = (box.dieren || []).length + (box.accessoires || []).length;
  const isOffline = !!box.offline;
  const nogNietTeKoop = boxIsNogNietTeKoop(box);
  const automatischOffline = boxIsAutomatischOffline(box);
  // Geldt voor iedereen die deze kaart ziet: sitebeheer ziet ook offline/nog-niet-te-koop
  // kisten (en kan ze hier niet per ongeluk kopen); spelers zien een teaser-kist (zie
  // laadWinkelBoxen) ook zonder dat ze hem al kunnen kopen.
  const nietTeKoop = isOffline || nogNietTeKoop || automatischOffline;
  const genoegMunten = !nietTeKoop && haalMunten() >= (box.prijs || 0);
  const algemeenAlGekocht = haalGekochteBoxen().indexOf(boxId) !== -1;
  let html = '<div class="quiz-item-body">' +
    '<div class="quiz-item-info"><strong>🎁 ' + escapeHtml(box.naam || 'Mysteriebox') + '</strong>' +
    '<span>' + (box.prijs || 0) + ' munten · ' + aantalItems + ' verrassing(en) erin</span>';
  if (algemeenAlGekocht) {
    html += '<span class="box-al-gekocht">✅ Al eerder gekocht</span>';
  }
  if (sitebeheerActief) {
    html += '<span class="box-aantal-gekocht">🛒 ' + (box.aantalGekocht || 0) + 'x gekocht (door alle spelers)</span>';
    if (isOffline) {
      html += '<span class="box-status box-status-offline">🔒 Offline — alleen jij ziet deze kist</span>';
    } else if (automatischOffline) {
      html += '<span class="box-status box-status-offline">🔒 Automatisch offline sinds ' + escapeHtml(formatBoxDatum(box.totDatum)) + '</span>';
    } else if (nogNietTeKoop) {
      html += '<span class="box-status box-status-vanaf">⏳ Te koop vanaf ' + escapeHtml(formatBoxDatum(box.vanafDatum)) +
        (box.teaserZichtbaar ? ' · spelers zien alvast dat hij eraan komt' : ' · nog helemaal onzichtbaar voor spelers') + '</span>';
    } else if (box.vanafDatum || box.totDatum) {
      // Kist is nu gewoon te koop, maar heeft een vanaf- en/of tot-datum ingesteld:
      // laat de hele looptijd zien, niet alleen de tot-datum.
      let looptijdTekst;
      if (box.vanafDatum && box.totDatum) {
        looptijdTekst = 'Te koop van ' + formatBoxDatum(box.vanafDatum) + ' tot ' + formatBoxDatum(box.totDatum);
      } else if (box.vanafDatum) {
        looptijdTekst = 'Te koop sinds ' + formatBoxDatum(box.vanafDatum);
      } else {
        looptijdTekst = 'Te koop tot ' + formatBoxDatum(box.totDatum);
      }
      html += '<span class="box-status box-status-vanaf">📅 ' + escapeHtml(looptijdTekst) + '</span>';
    }
  } else if (nogNietTeKoop) {
    // Spelers zien deze kaart bij een nog-niet-te-koop kist alleen als sitebeheer
    // "teaserZichtbaar" heeft aangezet (zie het filteren in laadWinkelBoxen). Is er ook
    // een "tot"-datum ingesteld, dan laten we spelers meteen zien tot wanneer de kist
    // er dan zal zijn, niet alleen wanneer hij begint.
    const teaserTekst = box.totDatum
      ? 'Binnenkort — te koop van ' + formatBoxDatum(box.vanafDatum) + ' tot ' + formatBoxDatum(box.totDatum)
      : 'Binnenkort — te koop vanaf ' + formatBoxDatum(box.vanafDatum);
    html += '<span class="box-status box-status-vanaf">⏳ ' + escapeHtml(teaserTekst) + '</span>';
  } else if (box.totDatum) {
    // Kist is nu gewoon te koop en heeft een tot-datum: laat spelers ook zien tot
    // wanneer ze hem nog kunnen kopen.
    html += '<span class="box-status box-status-vanaf">⏳ Nog te koop tot ' + escapeHtml(formatBoxDatum(box.totDatum)) + '</span>';
  }
  html += '</div>' +
    '<div class="quiz-item-knoppen">' +
    '<button class="btn btn-primary btn-koop-box" data-box="' + boxId + '"' + (genoegMunten ? '' : ' disabled') + '>' +
    (nietTeKoop ? 'Nog niet te koop' : (genoegMunten ? 'Kopen' : 'Niet genoeg munten')) + '</button>';
  if (sitebeheerActief) {
    const offlineKnopTekst = isOffline ? '📶 Online zetten' : '📴 Offline halen';
    html += '<button type="button" class="btn-aanpassen-quiz btn-aanpassen-box" data-box="' + boxId + '">Aanpassen</button>' +
      '<button type="button" class="btn-blokkeren-quiz btn-offline-box' + (isOffline ? ' is-geblokkeerd' : '') + '" data-box="' + boxId + '">' + offlineKnopTekst + '</button>' +
      '<button type="button" class="btn-verwijderen-quiz btn-verwijderen-box" data-box="' + boxId + '">Verwijderen</button>';
  }
  html += '</div></div>';
  return html;
}

// Onthoudt of het overzicht "kisten die nog komen" open of ingeklapt staat.
let komendeKistenOverzichtOpen = false;

// Alleen voor sitebeheer: inklapbaar overzicht van kisten met een "te koop vanaf"-datum
// die nog in de toekomst ligt, op datum gesorteerd (eerstkomende bovenaan).
function toonKomendeKistenOverzicht(alleBoxen) {
  const lijstEl = document.getElementById('winkel-boxen-lijst');
  let overzichtEl = document.getElementById('winkel-komende-kisten-overzicht');

  if (!sitebeheerActief) {
    if (overzichtEl) overzichtEl.remove();
    return;
  }

  const komendeKisten = Object.keys(alleBoxen)
    .map(boxId => alleBoxen[boxId])
    .filter(boxIsNogNietTeKoop)
    .sort((a, b) => (a.vanafDatum || '').localeCompare(b.vanafDatum || ''));

  if (!komendeKisten.length) {
    if (overzichtEl) overzichtEl.remove();
    return;
  }

  if (!overzichtEl) {
    overzichtEl = document.createElement('div');
    overzichtEl.id = 'winkel-komende-kisten-overzicht';
    overzichtEl.className = 'sitebeheer-makers';
    lijstEl.parentNode.insertBefore(overzichtEl, lijstEl);
  }

  const rijenHtml = komendeKisten.map(box => {
    const offlineNotitie = box.offline ? ' · staat daarnaast ook nog handmatig offline' : '';
    const teaserNotitie = box.teaserZichtbaar ? ' · 👀 spelers zien hem al' : ' · 🙈 nog onzichtbaar voor spelers';
    const totNotitie = box.totDatum ? (' · daarna automatisch offline op ' + escapeHtml(formatBoxDatum(box.totDatum))) : '';
    return '<div class="sitebeheer-maker-rij">' +
      '<div class="sitebeheer-maker-naam-rij"><strong>🎁 ' + escapeHtml(box.naam || 'Mysteriebox') + '</strong>' +
      '<span class="sitebeheer-maker-telling">' + (box.prijs || 0) + ' munten</span></div>' +
      '<span class="sitebeheer-maker-telling">⏳ Te koop vanaf ' + escapeHtml(formatBoxDatum(box.vanafDatum)) + totNotitie + teaserNotitie + offlineNotitie + '</span>' +
      '</div>';
  }).join('');

  overzichtEl.innerHTML =
    '<details class="sitebeheer-makers-details"' + (komendeKistenOverzichtOpen ? ' open' : '') + '>' +
    '<summary>🔜 Kisten die nog komen (' + komendeKisten.length + ')</summary>' +
    rijenHtml +
    '</details>';

  const detailsEl = overzichtEl.querySelector('details');
  detailsEl.addEventListener('toggle', () => {
    komendeKistenOverzichtOpen = detailsEl.open;
  });
}

function laadWinkelBoxen() {
  werkMuntenWeergaveBij();
  document.getElementById('btn-winkel-nieuwe-box').style.display = sitebeheerActief ? 'block' : 'none';
  const lijstEl = document.getElementById('winkel-boxen-lijst');
  const geenBoxenEl = document.getElementById('winkel-geen-boxen');
  lijstEl.innerHTML = '<p class="subtitel">Boxen laden...</p>';
  geenBoxenEl.style.display = 'none';

  db.ref('mysterieboxen').once('value').then(snapshot => {
    const alleBoxen = snapshot.val() || {};
    alleMysterieboxenCache = alleBoxen;
    toonKomendeKistenOverzicht(alleBoxen);
    // Gewone spelers zien nooit offline of automatisch-offline kisten. Een kist die nog
    // niet te koop is, blijft ook verborgen — tenzij sitebeheer bij die kist "teaser"
    // heeft aangezet, dan mogen spelers alvast zien dat hij eraan komt (zonder te kunnen kopen).
    const boxen = sitebeheerActief ? alleBoxen : Object.keys(alleBoxen).reduce((resultaat, boxId) => {
      const box = alleBoxen[boxId];
      if (box.offline || boxIsAutomatischOffline(box)) return resultaat;
      if (boxIsNogNietTeKoop(box) && !box.teaserZichtbaar) return resultaat;
      resultaat[boxId] = box;
      return resultaat;
    }, {});
    const boxIds = Object.keys(boxen);
    lijstEl.innerHTML = '';
    geenBoxenEl.style.display = boxIds.length ? 'none' : 'block';

    boxIds.forEach(boxId => {
      const box = boxen[boxId];
      const kaart = document.createElement('div');
      kaart.className = 'quiz-item';
      kaart.innerHTML = bouwBoxKaartHtml(boxId, box);
      lijstEl.appendChild(kaart);
    });

    lijstEl.querySelectorAll('.btn-koop-box').forEach(knop => {
      knop.addEventListener('click', () => koopMysteriebox(knop.dataset.box));
    });
    lijstEl.querySelectorAll('.btn-aanpassen-box').forEach(knop => {
      knop.addEventListener('click', () => openBoxBewerken(knop.dataset.box, boxen[knop.dataset.box]));
    });
    lijstEl.querySelectorAll('.btn-verwijderen-box').forEach(knop => {
      knop.addEventListener('click', () => verwijderMysteriebox(knop.dataset.box));
    });
    lijstEl.querySelectorAll('.btn-offline-box').forEach(knop => {
      knop.addEventListener('click', () => zetBoxOffline(knop.dataset.box, !boxen[knop.dataset.box].offline));
    });
  }).catch(() => {
    lijstEl.innerHTML = '<p class="subtitel">De boxen konden niet geladen worden.</p>';
  });
}

// Zet een kist offline (alleen sitebeheer ziet hem dan nog) of weer online.
function zetBoxOffline(boxId, offline) {
  db.ref('mysterieboxen/' + boxId + '/offline').set(!!offline).then(laadWinkelBoxen).catch(() => {
    alert('Dit is niet gelukt. Probeer het opnieuw.');
  });
}

function koopMysteriebox(boxId) {
  db.ref('mysterieboxen/' + boxId).once('value').then(snapshot => {
    const box = snapshot.val();
    if (!box) {
      alert('Deze mysteriebox bestaat niet meer.');
      laadWinkelBoxen();
      return;
    }
    if (!sitebeheerActief && (box.offline || boxIsNogNietTeKoop(box) || boxIsAutomatischOffline(box))) {
      alert('Deze mysteriebox is nu niet te koop.');
      laadWinkelBoxen();
      return;
    }
    if (haalMunten() < (box.prijs || 0)) {
      alert('Je hebt niet genoeg munten voor deze box.');
      return;
    }

    zetMunten(haalMunten() - (box.prijs || 0));
    voegBezitToe(box.dieren, box.accessoires);
    voegGekochteBoxToe(boxId);
    // Telt voor sitebeheer bij hoeveel spelers deze box al gekocht is (transaction,
    // want meerdere spelers kunnen tegelijk kopen).
    db.ref('mysterieboxen/' + boxId + '/aantalGekocht').transaction(huidig => (huidig || 0) + 1);

    const gekregenNamen = [].concat(
      (box.dieren || []).filter(d => DIER_TEKENINGEN[d]),
      (box.accessoires || []).filter(a => ACCESSOIRES[a]).map(a => ACCESSOIRES[a].naam)
    );
    alert('🎉 Je hebt "' + (box.naam || 'Mysteriebox') + '" geopend! Je hebt nu ook: ' + gekregenNamen.join(', '));

    laadWinkelBoxen();
  });
}

function verwijderMysteriebox(boxId) {
  if (!confirm('Deze mysteriebox definitief verwijderen? Spelers die hem al gekocht hebben, houden gewoon wat ze al kregen.')) return;
  db.ref('mysterieboxen/' + boxId).remove().then(laadWinkelBoxen).catch(() => {
    alert('Verwijderen is niet gelukt. Controleer Firebase (regel voor mysterieboxen) en probeer het opnieuw.');
  });
}

document.getElementById('btn-winkel-nieuwe-box').addEventListener('click', () => openBoxBewerken(null, null));

// ---------- Mysteriebox ontwerpen (alleen sitebeheer) ----------

let bewerkteBoxId = null;
let bewerkteBoxOffline = false;
let boxGeselecteerdeDieren = [];
let boxGeselecteerdeAccessoires = [];

const boxBewerkenOverlayEl = document.getElementById('box-bewerken-overlay');
const inputBoxNaamEl = document.getElementById('input-box-naam');
const inputBoxPrijsEl = document.getElementById('input-box-prijs');
const inputBoxVanafEl = document.getElementById('input-box-vanaf');
const inputBoxTotEl = document.getElementById('input-box-tot');
const inputBoxTeaserEl = document.getElementById('input-box-teaser');
const boxBewerkenFoutmeldingEl = document.getElementById('box-bewerken-foutmelding');

// Telt in hoeveel andere kisten (dus niet de kist die nu bewerkt wordt) een bepaald
// dier of accessoire al zit, zodat sitebeheer dat ziet als een getalletje op de knop.
function telGebruikInAndereBoxen(soort, waarde) {
  let aantal = 0;
  Object.keys(alleMysterieboxenCache).forEach(boxId => {
    if (boxId === bewerkteBoxId) return;
    const andereBox = alleMysterieboxenCache[boxId];
    if (andereBox && Array.isArray(andereBox[soort]) && andereBox[soort].indexOf(waarde) !== -1) {
      aantal++;
    }
  });
  return aantal;
}

// Bouwt de kiesknoppen voor élk dier en élk accessoire uit de hele catalogus
// (niet alleen wat de sitebeheerder zelf al bezit): sitebeheer ontwerpt hier
// immers juist de boxen waarmee andere spelers nieuwe dingen kunnen winnen.
function bouwBoxItemsKiezer() {
  const dierenEl = document.getElementById('box-items-dieren');
  dierenEl.innerHTML = '';
  DIEREN.forEach(dier => {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'dier-knop';
    knop.innerHTML = poppetjeSvg(dier, {});
    const gebruiktIn = telGebruikInAndereBoxen('dieren', dier);
    if (gebruiktIn > 0) {
      knop.innerHTML += '<span class="dier-knop-badge" title="Zit al in ' + gebruiktIn + ' andere kist(en)">' + gebruiktIn + '</span>';
    }
    knop.classList.toggle('gekozen', boxGeselecteerdeDieren.indexOf(dier) !== -1);
    knop.setAttribute('aria-label', 'Kies ' + dier);
    knop.addEventListener('click', () => {
      const i = boxGeselecteerdeDieren.indexOf(dier);
      if (i === -1) boxGeselecteerdeDieren.push(dier); else boxGeselecteerdeDieren.splice(i, 1);
      knop.classList.toggle('gekozen');
    });
    dierenEl.appendChild(knop);
  });

  const accEl = document.getElementById('box-items-accessoires');
  accEl.innerHTML = '';
  const voorbeeldDier = DIEREN[0];
  ACCESSOIRE_GROEPEN.forEach(groep => {
    groep.items.forEach(emoji => {
      const voorbeeld = {};
      voorbeeld[groep.plek] = emoji;
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'dier-knop';
      knop.innerHTML = poppetjeSvg(voorbeeldDier, voorbeeld);
      knop.title = ACCESSOIRES[emoji].naam;
      const gebruiktIn = telGebruikInAndereBoxen('accessoires', emoji);
      if (gebruiktIn > 0) {
        knop.innerHTML += '<span class="dier-knop-badge" title="Zit al in ' + gebruiktIn + ' andere kist(en)">' + gebruiktIn + '</span>';
      }
      knop.setAttribute('aria-label', 'Kies ' + ACCESSOIRES[emoji].naam);
      knop.classList.toggle('gekozen', boxGeselecteerdeAccessoires.indexOf(emoji) !== -1);
      knop.addEventListener('click', () => {
        const i = boxGeselecteerdeAccessoires.indexOf(emoji);
        if (i === -1) boxGeselecteerdeAccessoires.push(emoji); else boxGeselecteerdeAccessoires.splice(i, 1);
        knop.classList.toggle('gekozen');
      });
      accEl.appendChild(knop);
    });
  });
}

function openBoxBewerken(boxId, box) {
  bewerkteBoxId = boxId;
  bewerkteBoxOffline = box ? !!box.offline : false;
  boxGeselecteerdeDieren = (box && box.dieren) ? box.dieren.slice() : [];
  boxGeselecteerdeAccessoires = (box && box.accessoires) ? box.accessoires.slice() : [];

  document.getElementById('box-bewerken-titel').textContent = boxId ? 'Mysteriebox aanpassen' : 'Nieuwe mysteriebox';
  inputBoxNaamEl.value = box ? (box.naam || '') : '';
  inputBoxPrijsEl.value = box ? (box.prijs || 0) : 100;
  inputBoxVanafEl.value = box ? (box.vanafDatum || '') : '';
  inputBoxTotEl.value = box ? (box.totDatum || '') : '';
  inputBoxTeaserEl.checked = box ? !!box.teaserZichtbaar : false;
  boxBewerkenFoutmeldingEl.textContent = '';
  document.getElementById('btn-box-verwijderen').style.display = boxId ? 'inline-block' : 'none';

  bouwBoxItemsKiezer();
  boxBewerkenOverlayEl.classList.add('actief');
}

document.getElementById('btn-box-annuleren').addEventListener('click', () => {
  boxBewerkenOverlayEl.classList.remove('actief');
});

document.getElementById('btn-box-verwijderen').addEventListener('click', () => {
  if (!bewerkteBoxId) return;
  const boxId = bewerkteBoxId;
  boxBewerkenOverlayEl.classList.remove('actief');
  verwijderMysteriebox(boxId);
});

document.getElementById('btn-box-opslaan').addEventListener('click', () => {
  const naam = inputBoxNaamEl.value.trim();
  const prijs = parseInt(inputBoxPrijsEl.value, 10) || 0;

  if (!naam) {
    boxBewerkenFoutmeldingEl.textContent = 'Vul een naam voor de box in.';
    return;
  }
  if (prijs < 0) {
    boxBewerkenFoutmeldingEl.textContent = 'De prijs kan niet negatief zijn.';
    return;
  }
  if (!boxGeselecteerdeDieren.length && !boxGeselecteerdeAccessoires.length) {
    boxBewerkenFoutmeldingEl.textContent = 'Kies minstens één dier of accessoire voor in de box.';
    return;
  }
  if (inputBoxVanafEl.value && inputBoxTotEl.value && inputBoxTotEl.value <= inputBoxVanafEl.value) {
    boxBewerkenFoutmeldingEl.textContent = '"Automatisch offline vanaf" moet na "Te koop vanaf" liggen.';
    return;
  }

  const boxData = {
    naam: naam,
    prijs: prijs,
    dieren: boxGeselecteerdeDieren,
    accessoires: boxGeselecteerdeAccessoires,
    vanafDatum: inputBoxVanafEl.value || null,
    totDatum: inputBoxTotEl.value || null,
    teaserZichtbaar: !!inputBoxTeaserEl.checked,
    offline: bewerkteBoxOffline
  };

  const ref = bewerkteBoxId ? db.ref('mysterieboxen/' + bewerkteBoxId) : db.ref('mysterieboxen').push();
  ref.set(boxData).then(() => {
    boxBewerkenOverlayEl.classList.remove('actief');
    laadWinkelBoxen();
  }).catch(() => {
    boxBewerkenFoutmeldingEl.textContent = 'Opslaan is niet gelukt. Probeer het opnieuw.';
  });
});

// ---------- Geluksrad (1x per dag gratis draaien voor munten) ----------
// Rad staat in Firebase onder "geluksrad/segmenten" (een array), naast mysterieboxen —
// zie readme.md voor de bijbehorende Firebase-regel. Is er nog niets ingesteld door
// sitebeheer, dan gebruiken we STANDAARD_WIEL_SEGMENTEN zodat het rad meteen werkt.

const WIEL_LAATSTE_DRAAI_SLEUTEL = 'quizAppWielLaatsteDraai';
const WIEL_LAATSTE_RESULTAAT_SLEUTEL = 'quizAppWielLaatsteResultaat';
// Hoeveel volle rondes het rad draait vóór het bij het gekozen vak uitkomt (voor het effect).
const WIEL_EXTRA_RONDES = 5;
// Moet gelijk zijn aan de transition-duration van .wiel-schijf in style.css (in ms).
const WIEL_DRAAI_DUUR_MS = 4200;
// Kleuren voor de vakken, worden cyclisch gebruikt (zoals in het voorbeeldplaatje van een geluksrad).
const WIEL_KLEUREN = ['#f2c14e', '#3fc6f0', '#e0459a', '#8b3fe0', '#f0524a', '#f2933e', '#39c98f', '#4a6bf0'];

const STANDAARD_WIEL_SEGMENTEN = [
  { naam: '5 munten', type: 'munten', munten: 5, kans: 3 },
  { naam: '10 munten', type: 'munten', munten: 10, kans: 3 },
  { naam: '2 munten', type: 'munten', munten: 2, kans: 4 },
  { naam: '20 munten', type: 'munten', munten: 20, kans: 2 },
  { naam: '🐶', type: 'dier', dier: '🐶', kans: 1 },
  { naam: '5 munten', type: 'munten', munten: 5, kans: 3 },
  { naam: '50 munten', type: 'munten', munten: 50, kans: 1 },
  { naam: '10 munten', type: 'munten', munten: 10, kans: 3 },
  { naam: '🐱', type: 'dier', dier: '🐱', kans: 1 },
  { naam: '100 munten', type: 'munten', munten: 100, kans: 1 }
];

let wielSegmentenCache = STANDAARD_WIEL_SEGMENTEN;
let wielSegmentenMetHoek = [];
let wielHuidigeRotatie = 0;
let wielDraaitNu = false;

// Zet de rauwe segmenten (naam/munten/kans) om naar segmenten met een startHoek en
// breedteHoek (in graden, 0° = boven bij de wijzer, met de klok mee) op basis van de
// "kans"-gewichten. Een groter vak = een hoger gewicht = vaker gewonnen.
function berekenWielHoeken(segmenten) {
  const totaalKans = segmenten.reduce((som, s) => som + (s.kans > 0 ? s.kans : 0), 0);
  let cursor = 0;
  return segmenten.map((s, i) => {
    const gewicht = s.kans > 0 ? s.kans : 1;
    const breedte = totaalKans > 0 ? (gewicht / totaalKans) * 360 : (360 / segmenten.length);
    const metHoek = {
      naam: s.naam, type: s.type || 'munten', munten: s.munten, dier: s.dier, accessoire: s.accessoire,
      kans: s.kans, kleur: WIEL_KLEUREN[i % WIEL_KLEUREN.length], startHoek: cursor, breedteHoek: breedte
    };
    cursor += breedte;
    return metHoek;
  });
}

// Kiest een vak, met precies dezelfde kansverhouding als de grootte van de vakken op het rad.
function kiesGewogenWielSegment(segmentenMetHoek) {
  const totaal = segmentenMetHoek.reduce((som, s) => som + s.breedteHoek, 0);
  let r = Math.random() * totaal;
  for (let i = 0; i < segmentenMetHoek.length; i++) {
    if (r < segmentenMetHoek[i].breedteHoek) return segmentenMetHoek[i];
    r -= segmentenMetHoek[i].breedteHoek;
  }
  return segmentenMetHoek[segmentenMetHoek.length - 1];
}

// Bouwt de SVG-taart van het rad op basis van de segmenten-met-hoek.
function bouwWielSvg(segmentenMetHoek) {
  const cx = 140, cy = 140, r = 132;
  const naarPunt = (hoekGraden) => {
    const rad = (hoekGraden - 90) * Math.PI / 180; // -90 zodat 0° boven is
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  let paden = '';
  let labels = '';
  segmentenMetHoek.forEach(s => {
    const start = naarPunt(s.startHoek);
    const eind = naarPunt(s.startHoek + s.breedteHoek);
    const grootBoog = s.breedteHoek > 180 ? 1 : 0;
    paden += '<path d="M ' + cx + ' ' + cy + ' L ' + start[0].toFixed(1) + ' ' + start[1].toFixed(1) +
      ' A ' + r + ' ' + r + ' 0 ' + grootBoog + ' 1 ' + eind[0].toFixed(1) + ' ' + eind[1].toFixed(1) + ' Z" fill="' + s.kleur + '" stroke="#0b1029" stroke-width="2"></path>';
    if (s.breedteHoek > 8) {
      const midHoek = s.startHoek + s.breedteHoek / 2;
      const labelPunt = naarPunt(midHoek);
      const labelX = cx + (labelPunt[0] - cx) * 0.62;
      const labelY = cy + (labelPunt[1] - cy) * 0.62;
      labels += '<text x="' + labelX.toFixed(1) + '" y="' + labelY.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="15" font-weight="700" fill="#0b1029">' + escapeHtml(s.naam) + '</text>';
    }
  });
  return '<svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">' + paden + labels + '</svg>';
}

// Werkt de knop-tekst en de statusregel onder het rad bij, afhankelijk van of er vandaag
// al gedraaid is.
function werkWielStatusBij() {
  const knopEl = document.getElementById('btn-wiel-draaien');
  const statusEl = document.getElementById('wiel-status');
  const resultaatEl = document.getElementById('wiel-resultaat');
  const vandaag = huidigeDatumTekst();
  const alGedraaidVandaag = localStorage.getItem(WIEL_LAATSTE_DRAAI_SLEUTEL) === vandaag;

  if (alGedraaidVandaag) {
    knopEl.disabled = true;
    statusEl.textContent = '⏳ Je hebt vandaag al gedraaid. Kom morgen terug voor een nieuwe beurt!';
    const laatsteResultaat = localStorage.getItem(WIEL_LAATSTE_RESULTAAT_SLEUTEL);
    resultaatEl.textContent = laatsteResultaat ? ('🎉 Vandaag gewonnen: ' + laatsteResultaat) : '';
  } else {
    knopEl.disabled = wielDraaitNu;
    statusEl.textContent = wielDraaitNu ? '' : 'Klik op de knop in het midden van het rad om te draaien!';
    if (!wielDraaitNu) resultaatEl.textContent = '';
  }
}

function laadGeluksrad() {
  werkMuntenWeergaveBij();
  document.getElementById('btn-wiel-aanpassen').style.display = sitebeheerActief ? 'inline-block' : 'none';
  wielHuidigeRotatie = 0;
  const schijfEl = document.getElementById('wiel-schijf');
  schijfEl.style.transition = 'none';
  schijfEl.style.transform = 'rotate(0deg)';

  db.ref('geluksrad/segmenten').once('value').then(snapshot => {
    const opgeslagen = snapshot.val();
    wielSegmentenCache = (Array.isArray(opgeslagen) && opgeslagen.length >= 2) ? opgeslagen : STANDAARD_WIEL_SEGMENTEN;
    wielSegmentenMetHoek = berekenWielHoeken(wielSegmentenCache);
    schijfEl.innerHTML = bouwWielSvg(wielSegmentenMetHoek);
    // Forceer een reflow zodat de volgende draai-transitie weer gewoon animeert
    // (na het instant terugzetten naar 0° hierboven).
    void schijfEl.offsetWidth;
    schijfEl.style.transition = '';
    werkWielStatusBij();
  }).catch(() => {
    wielSegmentenCache = STANDAARD_WIEL_SEGMENTEN;
    wielSegmentenMetHoek = berekenWielHoeken(wielSegmentenCache);
    schijfEl.innerHTML = bouwWielSvg(wielSegmentenMetHoek);
    werkWielStatusBij();
  });
}

function draaiRad() {
  if (wielDraaitNu) return;
  const vandaag = huidigeDatumTekst();
  if (localStorage.getItem(WIEL_LAATSTE_DRAAI_SLEUTEL) === vandaag) return;
  if (!wielSegmentenMetHoek.length) return;

  wielDraaitNu = true;
  werkWielStatusBij();

  const gekozenSegment = kiesGewogenWielSegment(wielSegmentenMetHoek);
  const marge = Math.min(wielSegmentenMetHoek.length > 1 ? gekozenSegment.breedteHoek * 0.15 : 0, 10);
  const speling = Math.max(gekozenSegment.breedteHoek - marge * 2, 0.01);
  const doelHoek = gekozenSegment.startHoek + marge + Math.random() * speling;

  const huidigeBasis = ((wielHuidigeRotatie % 360) + 360) % 360;
  let extra = (360 - doelHoek) - huidigeBasis;
  extra = ((extra % 360) + 360) % 360;
  wielHuidigeRotatie += WIEL_EXTRA_RONDES * 360 + extra;

  document.getElementById('wiel-schijf').style.transform = 'rotate(' + wielHuidigeRotatie + 'deg)';

  setTimeout(() => {
    wielDraaitNu = false;
    localStorage.setItem(WIEL_LAATSTE_DRAAI_SLEUTEL, vandaag);
    localStorage.setItem(WIEL_LAATSTE_RESULTAAT_SLEUTEL, gekozenSegment.naam);
    if (gekozenSegment.type === 'dier' && gekozenSegment.dier) {
      voegBezitToe([gekozenSegment.dier], []);
    } else if (gekozenSegment.type === 'accessoire' && gekozenSegment.accessoire) {
      voegBezitToe([], [gekozenSegment.accessoire]);
    } else if (gekozenSegment.munten) {
      geefMunten(gekozenSegment.munten);
    }
    document.getElementById('wiel-resultaat').textContent = '🎉 Je hebt gewonnen: ' + gekozenSegment.naam + '!';
    werkWielStatusBij();
  }, WIEL_DRAAI_DUUR_MS);
}

document.getElementById('btn-wiel-draaien').addEventListener('click', draaiRad);

// ---------- Geluksrad aanpassen (alleen sitebeheer) ----------

const wielBewerkenOverlayEl = document.getElementById('wiel-bewerken-overlay');
const wielSegmentenLijstEl = document.getElementById('wiel-segmenten-lijst');
const sjabloonWielSegmentRij = document.getElementById('sjabloon-wiel-segment-rij');
const wielBewerkenFoutmeldingEl = document.getElementById('wiel-bewerken-foutmelding');

// Vult de dier- en accessoire-keuzelijst van één rij met de hele catalogus (net als bij
// het maken van een mysteriebox: ook de dieren/accessoires die niet standaard te kiezen zijn).
function vulWielDierAccessoireSelects(rij) {
  const dierSelectEl = rij.querySelector('.wiel-segment-dier');
  DIEREN.forEach(dier => {
    const optie = document.createElement('option');
    optie.value = dier;
    optie.textContent = dier;
    dierSelectEl.appendChild(optie);
  });

  const accSelectEl = rij.querySelector('.wiel-segment-accessoire');
  ACCESSOIRE_GROEPEN.forEach(groep => {
    groep.items.forEach(emoji => {
      const optie = document.createElement('option');
      optie.value = emoji;
      optie.textContent = emoji + ' ' + ACCESSOIRES[emoji].naam;
      accSelectEl.appendChild(optie);
    });
  });
}

// Laat bij een rij alleen het invoerveld zien dat bij het gekozen type hoort
// (munten-aantal, dier-keuze of accessoire-keuze).
function werkWielSegmentTypeWeergaveBij(rij) {
  const type = rij.querySelector('.wiel-segment-type').value;
  rij.querySelector('.wiel-segment-munten').style.display = type === 'munten' ? '' : 'none';
  rij.querySelector('.wiel-segment-dier').style.display = type === 'dier' ? '' : 'none';
  rij.querySelector('.wiel-segment-accessoire').style.display = type === 'accessoire' ? '' : 'none';
}

function voegWielSegmentRijToe(segment) {
  const kloon = sjabloonWielSegmentRij.content.cloneNode(true);
  const rij = kloon.querySelector('.wiel-segment-rij');
  const type = segment ? (segment.type || 'munten') : 'munten';

  vulWielDierAccessoireSelects(rij);

  rij.querySelector('.wiel-segment-type').value = type;
  rij.querySelector('.wiel-segment-naam').value = segment ? (segment.naam || '') : '';
  rij.querySelector('.wiel-segment-munten').value = segment ? (segment.munten || 0) : 10;
  if (segment && segment.dier) rij.querySelector('.wiel-segment-dier').value = segment.dier;
  if (segment && segment.accessoire) rij.querySelector('.wiel-segment-accessoire').value = segment.accessoire;
  rij.querySelector('.wiel-segment-kans').value = segment ? (segment.kans || 1) : 1;

  werkWielSegmentTypeWeergaveBij(rij);
  rij.querySelector('.wiel-segment-type').addEventListener('change', () => werkWielSegmentTypeWeergaveBij(rij));
  rij.querySelector('.wiel-segment-verwijderen').addEventListener('click', () => rij.remove());
  wielSegmentenLijstEl.appendChild(kloon);
}

function openGeluksradBewerken() {
  wielSegmentenLijstEl.innerHTML = '';
  wielBewerkenFoutmeldingEl.textContent = '';
  wielSegmentenCache.forEach(segment => voegWielSegmentRijToe(segment));
  wielBewerkenOverlayEl.classList.add('actief');
}

document.getElementById('btn-wiel-aanpassen').addEventListener('click', openGeluksradBewerken);

document.getElementById('btn-wiel-segment-toevoegen').addEventListener('click', () => {
  voegWielSegmentRijToe(null);
});

document.getElementById('btn-wiel-annuleren').addEventListener('click', () => {
  wielBewerkenOverlayEl.classList.remove('actief');
});

document.getElementById('btn-wiel-opslaan').addEventListener('click', () => {
  const rijen = wielSegmentenLijstEl.querySelectorAll('.wiel-segment-rij');
  const segmenten = [];
  let fout = '';

  rijen.forEach(rij => {
    if (fout) return;
    const type = rij.querySelector('.wiel-segment-type').value;
    const naamRuw = rij.querySelector('.wiel-segment-naam').value.trim();
    const kans = parseInt(rij.querySelector('.wiel-segment-kans').value, 10);
    if (isNaN(kans) || kans < 1) { fout = 'Vul bij elk vak een kans van minstens 1 in.'; return; }

    if (type === 'dier') {
      const dier = rij.querySelector('.wiel-segment-dier').value;
      if (!dier) { fout = 'Kies bij elk "dier"-vak welk dier het is.'; return; }
      segmenten.push({ naam: naamRuw || dier, type: 'dier', dier: dier, kans: kans });
    } else if (type === 'accessoire') {
      const accessoire = rij.querySelector('.wiel-segment-accessoire').value;
      if (!accessoire) { fout = 'Kies bij elk "accessoire"-vak welk accessoire het is.'; return; }
      segmenten.push({ naam: naamRuw || accessoire, type: 'accessoire', accessoire: accessoire, kans: kans });
    } else {
      const munten = parseInt(rij.querySelector('.wiel-segment-munten').value, 10);
      if (isNaN(munten) || munten < 0) { fout = 'Vul bij elk "munten"-vak een geldig aantal munten in (0 of meer).'; return; }
      segmenten.push({ naam: naamRuw || (munten + ' munten'), type: 'munten', munten: munten, kans: kans });
    }
  });

  if (!fout && segmenten.length < 2) {
    fout = 'Voeg minstens 2 vakken toe aan het rad.';
  }
  if (fout) {
    wielBewerkenFoutmeldingEl.textContent = fout;
    return;
  }

  db.ref('geluksrad/segmenten').set(segmenten).then(() => {
    wielBewerkenOverlayEl.classList.remove('actief');
    laadGeluksrad();
  }).catch(() => {
    wielBewerkenFoutmeldingEl.textContent = 'Opslaan is niet gelukt. Probeer het opnieuw.';
  });
});

// Toont de foto van een vraag (of verbergt het plaatje als er geen foto is).
function toonVraagFoto(imgId, url) {
  const imgEl = document.getElementById(imgId);
  if (url) {
    imgEl.src = url;
    imgEl.hidden = false;
  } else {
    imgEl.removeAttribute('src');
    imgEl.hidden = true;
  }
}

// Zet het/de goede antwoord(en) in het groot op het scherm.
// prefix is 'host' of 'speler' (bepaalt welke elementen gevuld worden).
function renderGroteAntwoorden(prefix, vraag) {
  document.getElementById(prefix + '-antwoord-label').textContent =
    vraag.goedAntwoorden.length > 1 ? 'De goede antwoorden' : 'Het goede antwoord';

  const containerEl = document.getElementById(prefix + '-antwoord-groot');
  containerEl.innerHTML = '';
  vraag.goedAntwoorden.forEach(nummer => {
    const optie = document.createElement('div');
    optie.className = 'antwoord-optie goed antwoord-groot';
    optie.textContent = vraag.antwoorden[nummer - 1];
    containerEl.appendChild(optie);
  });
}

function stopSessieListener() {
  if (huidigeSessieRef) {
    huidigeSessieRef.off();
    huidigeSessieRef = null;
  }
  stopHostTimer();
}

function luisterNaarSessie(code) {
  stopSessieListener();
  huidigeSessieRef = db.ref('sessies/' + code);
  huidigeSessieRef.on('value', snapshot => {
    const sessie = snapshot.val();
    if (!sessie) {
      // De sessie bestaat niet meer, bijv. omdat de quizmaster is gestopt/weggegaan.
      if (huidigeRol === 'speler') {
        stopSessieListener();
        huidigeRol = null;
        toonScherm('scherm-speler-host-weg');
      }
      return;
    }
    if (huidigeRol === 'host') {
      renderSessieVoorHost(sessie);
    } else if (huidigeRol === 'speler') {
      renderSessieVoorSpeler(sessie);
    }
  });
}

function renderScorebordLijst(containerId, spelers, eigenSpelerId) {
  const lijstEl = document.getElementById(containerId);
  lijstEl.innerHTML = '';

  const gesorteerdeSpelers = Object.entries(spelers || {}).sort((a, b) => {
    const scoreA = (a[1].score) || 0;
    const scoreB = (b[1].score) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const tijdA = (a[1].totaleReactietijd) || 0;
    const tijdB = (b[1].totaleReactietijd) || 0;
    return tijdA - tijdB; // sneller (lagere tijd) wint bij gelijke stand
  });

  gesorteerdeSpelers.forEach(([spelerId, speler], index) => {
    const rij = document.createElement('div');
    rij.className = 'scorebord-rij' + (spelerId === eigenSpelerId ? ' eigen' : '');

    const plek = document.createElement('div');
    plek.className = 'scorebord-plek';
    plek.textContent = '#' + (index + 1);

    const naam = document.createElement('div');
    naam.className = 'scorebord-naam';
    naam.textContent = speler.naam;

    const score = document.createElement('div');
    score.className = 'scorebord-score';
    score.textContent = formatPunten(speler.score || 0) + ' pt';

    rij.appendChild(plek); // 1e, 2e, 3e plek enz. blijven gewoon staan
    const dier = geldigDier(speler.dier);
    if (dier) {
      const dierEl = document.createElement('div');
      dierEl.className = 'scorebord-dier';
      dierEl.appendChild(maakPoppetje(dier, speler.accessoires));
      rij.appendChild(dierEl);
    }
    rij.appendChild(naam);
    rij.appendChild(score);
    lijstEl.appendChild(rij);
  });
}

// ---------- Hosten (de maker van de quiz speelt hem live) ----------

function startHostenVanQuiz(code) {
  db.ref('quizzen/' + code).once('value').then(snapshot => {
    const quizData = snapshot.val();
    if (!quizData) {
      alert('Deze quiz kon niet gevonden worden (misschien is hij verwijderd).');
      return;
    }

    huidigeQuizVragen = (quizData.vragen || []).map(normaliseerVraag);
    huidigeQuizTitel = quizData.titel;
    huidigeQuizTijdslimiet = quizData.tijdslimiet || TIJDSLIMIET_STANDAARD;
    huidigeSessieCode = code;
    huidigeRol = 'host';
    huidigeVraagIndexHost = -1;

    const nieuweSessie = {
      status: 'wachtkamer',
      huidigeVraagIndex: -1,
      spelers: {},
      antwoorden: {}
    };

    const sessieRef = db.ref('sessies/' + code);
    sessieRef.set(nieuweSessie).then(() => {
      // Als de host de pagina sluit of de verbinding verliest, wordt de sessie
      // automatisch verwijderd. Spelers krijgen dit meteen te zien (zie luisterNaarSessie).
      sessieRef.onDisconnect().remove();

      document.getElementById('host-wachtkamer-titel').textContent = huidigeQuizTitel;
      document.getElementById('host-wachtkamer-code').textContent = code;
      toonScherm('scherm-host-wachtkamer');
      luisterNaarSessie(code);
    });
  });
}

// ---------- Wekker per vraag (alleen bij de quizmaster) ----------
//
// `vraagGestartOp` staat al in de sessie (wordt gezet zodra een vraag begint).
// De host telt daarvandaan zelf af; zo blijft de klok kloppen ook als het
// scherm om een andere reden opnieuw tekent (bijv. een speler antwoordt).
// Loopt de tijd af, dan gaat de host automatisch door naar het resultaat —
// hetzelfde als zelf op "Doorgaan" klikken, wat ook eerder mag.

function stopHostTimer() {
  if (hostTimerInterval) {
    clearInterval(hostTimerInterval);
    hostTimerInterval = null;
  }
  hostTimerVoorVraagGestartOp = null;
  const timerEl = document.getElementById('host-vraag-timer');
  if (timerEl) timerEl.hidden = true;
}

function werkHostTimerWeergaveBij(secondenOver) {
  const OMTREK = 283; // 2 * pi * 45 (zelfde als stroke-dasharray in de CSS)
  const fractie = huidigeQuizTijdslimiet > 0 ? secondenOver / huidigeQuizTijdslimiet : 0;
  document.getElementById('host-vraag-timer-getal').textContent = String(secondenOver);
  document.getElementById('host-vraag-timer-vulling')
    .style.setProperty('--doel', String(Math.round(OMTREK * (1 - fractie))));
  document.getElementById('host-vraag-timer').classList.toggle('bijna-om', secondenOver <= 5);
}

function startHostTimerAlsNodig(sessie) {
  const gestartOp = sessie.vraagGestartOp;
  if (!huidigeQuizTijdslimiet || !gestartOp) {
    stopHostTimer();
    return;
  }
  // Loopt de klok al voor deze vraag? Dan niet opnieuw beginnen bij elke
  // hertekening (bijv. omdat een speler net geantwoord heeft).
  if (hostTimerVoorVraagGestartOp === gestartOp) return;

  stopHostTimer();
  hostTimerVoorVraagGestartOp = gestartOp;
  document.getElementById('host-vraag-timer').hidden = false;

  const tick = () => {
    const verstrekenMs = Date.now() - gestartOp;
    const secondenOver = Math.max(0, Math.ceil((huidigeQuizTijdslimiet * 1000 - verstrekenMs) / 1000));
    werkHostTimerWeergaveBij(secondenOver);
    if (secondenOver <= 0) {
      stopHostTimer();
      berekenScoresEnToonResultaat();
    }
  };

  tick();
  hostTimerInterval = setInterval(tick, 250);
}

function renderSessieVoorHost(sessie) {
  huidigeVraagIndexHost = sessie.huidigeVraagIndex;
  const spelers = sessie.spelers || {};
  const aantalSpelers = Object.keys(spelers).length;

  // De wekker loopt alleen tijdens een vraag; bij elke andere status stoppen.
  if (sessie.status !== 'vraag') stopHostTimer();

  if (sessie.status === 'wachtkamer') {
    document.getElementById('host-wachtkamer-aantal').textContent = aantalSpelers + ' speler(s) aanwezig';

    const lijstEl = document.getElementById('host-wachtkamer-spelerslijst');
    lijstEl.innerHTML = '';
    Object.entries(spelers).forEach(([spelerId, speler]) => {
      const chip = document.createElement('div');
      chip.className = 'speler-chip';
      chip.title = 'Klik om ' + speler.naam + ' te verwijderen';
      const chipDier = geldigDier(speler.dier);
      if (chipDier) {
        const chipDierEl = document.createElement('span');
        chipDierEl.className = 'speler-chip-dier';
        chipDierEl.appendChild(maakPoppetje(chipDier, speler.accessoires));
        chip.appendChild(chipDierEl);
      }
      const chipNaamEl = document.createElement('span');
      chipNaamEl.className = 'speler-chip-naam';
      chipNaamEl.textContent = speler.naam;
      chip.appendChild(chipNaamEl);
      const chipKruisEl = document.createElement('span');
      chipKruisEl.className = 'speler-chip-kruis';
      chipKruisEl.innerHTML = '&times;';
      chip.appendChild(chipKruisEl);
      chip.addEventListener('click', () => {
        db.ref('sessies/' + huidigeSessieCode + '/spelers/' + spelerId).remove();
        db.ref('sessies/' + huidigeSessieCode + '/antwoorden').once('value').then(antwoordenSnapshot => {
          const antwoorden = antwoordenSnapshot.val() || {};
          Object.keys(antwoorden).forEach(vraagIndex => {
            if (antwoorden[vraagIndex] && antwoorden[vraagIndex][spelerId]) {
              db.ref('sessies/' + huidigeSessieCode + '/antwoorden/' + vraagIndex + '/' + spelerId).remove();
            }
          });
        });
      });
      lijstEl.appendChild(chip);
    });

    toonScherm('scherm-host-wachtkamer');
  }

  if (sessie.status === 'vraag') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];

    document.getElementById('host-voortgang-weergave').textContent =
      'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length +
      ' · ' + vraag.punten + (vraag.punten === 1 ? ' punt' : ' punten');
    document.getElementById('host-vraag-weergave').textContent = vraag.vraag;
    toonVraagFoto('host-vraag-foto', vraag.afbeelding);

    const antwoordenEl = document.getElementById('host-antwoorden-weergave');
    antwoordenEl.innerHTML = '';
    vraag.antwoorden.forEach(tekst => {
      const optie = document.createElement('div');
      optie.className = 'antwoord-optie';
      optie.textContent = tekst;
      antwoordenEl.appendChild(optie);
    });

    const antwoordenVoorVraag = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const aantalGeantwoord = Object.keys(antwoordenVoorVraag).length;
    const tellerEl = document.getElementById('host-antwoord-teller');
    tellerEl.classList.add('laad-rij');
    tellerEl.innerHTML = '<span class="laad-spinner"></span>' +
      aantalGeantwoord + ' van ' + aantalSpelers + ' spelers hebben geantwoord';

    toonScherm('scherm-host-vraag');

    // Heeft iedereen al geantwoord? Dan hoeft er niet meer gewacht te worden
    // op de wekker: automatisch door naar het resultaat (geen knop meer nodig
    // bij de vraag zelf). Zonder spelers (bijv. net allemaal verwijderd) wacht
    // de vraag gewoon op de wekker, in plaats van meteen door te schieten.
    if (aantalSpelers > 0 && aantalGeantwoord >= aantalSpelers) {
      stopHostTimer();
      berekenScoresEnToonResultaat();
    } else {
      startHostTimerAlsNodig(sessie);
    }
  }

  if (sessie.status === 'resultaat') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    const antwoordenVoorVraag = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const gegeven = Object.entries(antwoordenVoorVraag).filter(([spelerId]) => spelers[spelerId]);
    const aantalGeantwoord = gegeven.length;
    const aantalGoed = gegeven
      .filter(([, a]) => setsGelijk(a.antwoordIndexen || [], vraag.goedAntwoorden)).length;
    const aantalFout = aantalGeantwoord - aantalGoed;
    const aantalGeen = Math.max(0, aantalSpelers - aantalGeantwoord);

    document.getElementById('host-resultaat-voortgang').textContent =
      'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length;
    document.getElementById('host-resultaat-vraag').textContent = vraag.vraag;
    renderGroteAntwoorden('host', vraag);

    // Kop met een passende reactie
    let kop;
    if (aantalSpelers > 0 && aantalGoed === aantalSpelers) {
      kop = aantalSpelers === 1 ? '🎉 Goed gedaan!' : '🎉 Iedereen had het goed!';
    } else if (aantalGoed === 0) {
      kop = '😬 Niemand had het goed';
    } else if (aantalGoed * 2 >= aantalSpelers) {
      kop = '👏 Best goed gedaan!';
    } else {
      kop = '🤔 Dat was een lastige!';
    }
    document.getElementById('host-resultaat-kop').textContent = kop;

    // Ring: hoeveel van de spelers het goed had
    const OMTREK = 377; // 2 * pi * 60 (zelfde als stroke-dasharray in de CSS)
    const fractie = aantalSpelers > 0 ? aantalGoed / aantalSpelers : 0;
    const ringEl = document.getElementById('host-resultaat-ring');
    ringEl.style.setProperty('--doel', String(Math.round(OMTREK * (1 - fractie))));
    ringEl.classList.toggle('leeg', aantalGoed === 0);

    document.getElementById('host-resultaat-aantal').textContent = aantalGoed + '/' + aantalSpelers;
    document.getElementById('host-resultaat-telling').textContent =
      aantalGoed + ' van ' + aantalSpelers + (aantalSpelers === 1 ? ' speler' : ' spelers') +
      (aantalGoed === 1 ? ' had' : ' hadden') + ' het goed';

    document.getElementById('host-resultaat-chip-goed').textContent = '✔ ' + aantalGoed + ' goed';
    document.getElementById('host-resultaat-chip-fout').textContent = '✗ ' + aantalFout + ' fout';
    const geenChipEl = document.getElementById('host-resultaat-chip-geen');
    geenChipEl.textContent = '⏳ ' + aantalGeen + ' niet geantwoord';
    geenChipEl.hidden = aantalGeen === 0;

    toonScherm('scherm-host-resultaat');
  }

  if (sessie.status === 'scorebord' || sessie.status === 'afgelopen') {
    document.getElementById('host-scorebord-titel').textContent =
      sessie.status === 'afgelopen' ? 'Eindstand 🏆' : 'Scorebord';

    renderScorebordLijst('host-scorebord-lijst', spelers, null);

    const isLaatsteVraag = sessie.huidigeVraagIndex + 1 >= huidigeQuizVragen.length;
    const volgendeKnop = document.getElementById('btn-host-volgende-vraag');
    volgendeKnop.style.display = sessie.status === 'afgelopen' ? 'none' : 'block';
    volgendeKnop.textContent = isLaatsteVraag ? 'Bekijk eindstand' : 'Volgende vraag';

    toonScherm('scherm-host-scorebord');
  }
}

document.getElementById('btn-host-start-quiz').addEventListener('click', () => {
  db.ref('sessies/' + huidigeSessieCode).update({
    huidigeVraagIndex: 0,
    status: 'vraag',
    vraagGestartOp: Date.now()
  });
});

// Stap 1 (na de vraag): punten tellen en de spelers laten zien of ze het goed hadden.
// Gebeurt automatisch — er is geen "Doorgaan"-knop meer bij de vraag zelf:
// zodra iedereen geantwoord heeft (zie renderSessieVoorHost) of zodra de
// wekker afloopt (zie startHostTimerAlsNodig). De vergrendeling voorkomt dat
// punten dubbel geteld worden als dat toevallig tegelijk gebeurt.
function berekenScoresEnToonResultaat() {
  if (resultaatWordtBerekend) return Promise.resolve();
  resultaatWordtBerekend = true;
  const sessieRef = db.ref('sessies/' + huidigeSessieCode);
  return sessieRef.once('value').then(snapshot => {
    const sessie = snapshot.val();
    // Alleen tellen zolang de vraag nog loopt (voorkomt dubbel punten geven).
    if (!sessie || sessie.status !== 'vraag') return;

    const vraagIndex = sessie.huidigeVraagIndex;
    const vraag = huidigeQuizVragen[vraagIndex];
    const antwoordenVoorVraag = (sessie.antwoorden && sessie.antwoorden[vraagIndex]) || {};
    const spelers = sessie.spelers || {};

    const updates = {};
    Object.keys(antwoordenVoorVraag).forEach(spelerId => {
      if (!spelers[spelerId]) return; // speler is inmiddels weg
      const antwoord = antwoordenVoorVraag[spelerId];
      const gekozenIndexen = antwoord.antwoordIndexen || [];
      if (setsGelijk(gekozenIndexen, vraag.goedAntwoorden)) {
        const huidigeScore = spelers[spelerId].score || 0;
        const huidigeTijd = spelers[spelerId].totaleReactietijd || 0;
        updates['spelers/' + spelerId + '/score'] = huidigeScore + (typeof vraag.punten === 'number' ? vraag.punten : 1000);
        updates['spelers/' + spelerId + '/totaleReactietijd'] = huidigeTijd + (antwoord.reactietijdMs || 0);
      }
    });
    updates['status'] = 'resultaat';

    return sessieRef.update(updates);
  }).finally(() => {
    resultaatWordtBerekend = false;
  });
}

// Stap 2: het scorebord (zonder vraag en antwoord).
document.getElementById('btn-host-naar-scorebord').addEventListener('click', () => {
  db.ref('sessies/' + huidigeSessieCode).update({ status: 'scorebord' });
});

document.getElementById('btn-host-volgende-vraag').addEventListener('click', () => {
  const volgende = huidigeVraagIndexHost + 1;
  const sessieRef = db.ref('sessies/' + huidigeSessieCode);

  if (volgende < huidigeQuizVragen.length) {
    sessieRef.update({
      huidigeVraagIndex: volgende,
      status: 'vraag',
      vraagGestartOp: Date.now()
    });
  } else {
    sessieRef.update({ status: 'afgelopen' });
  }
});

document.getElementById('btn-host-afronden').addEventListener('click', () => {
  if (huidigeSessieCode) {
    db.ref('sessies/' + huidigeSessieCode).remove();
  }
  stopSessieListener();
  huidigeRol = null;
  toonScherm('scherm-algemeen');
});

document.getElementById('btn-host-verlaat-wachtkamer').addEventListener('click', () => {
  if (huidigeSessieCode) {
    db.ref('sessies/' + huidigeSessieCode).remove();
  }
  stopSessieListener();
  huidigeRol = null;
  toonScherm('scherm-algemeen');
});

// ---------- Meedoen aan quiz (speler) ----------

document.getElementById('btn-ga-naar-quiz').addEventListener('click', () => {
  const code = document.getElementById('input-code').value.trim().toUpperCase();
  const naam = document.getElementById('input-speler-naam').value.trim();
  const foutmelding = document.getElementById('meedoen-foutmelding');
  foutmelding.textContent = '';

  if (!code) {
    foutmelding.textContent = 'Vul een code in.';
    return;
  }
  if (!naam) {
    foutmelding.textContent = 'Vul je naam in.';
    return;
  }

  db.ref('quizzen/' + code).once('value')
    .then(snapshot => {
      const quizData = snapshot.val();
      if (!quizData) {
        foutmelding.textContent = 'Geen quiz gevonden met deze code.';
        return;
      }

      return db.ref('sessies/' + code).once('value').then(sessieSnapshot => {
        const sessie = sessieSnapshot.val();

        if (!sessie) {
          foutmelding.textContent = 'Deze quiz is nog niet gestart. Vraag de quizmaster om op "Spelen" te klikken op zijn/haar laptop.';
          return;
        }
        if (sessie.status !== 'wachtkamer') {
          foutmelding.textContent = 'Deze quiz is al begonnen, je kan er nu niet meer bij.';
          return;
        }

        huidigeQuizVragen = (quizData.vragen || []).map(normaliseerVraag);
        huidigeQuizTitel = quizData.titel;
        huidigeSessieCode = code;
        huidigeRol = 'speler';
        huidigeSpelerId = 'speler-' + Math.random().toString(36).slice(2, 10);
        laatstGetoondeVraagIndexSpeler = -1;
        muntenToegekendVoorSessie = null; // nieuwe sessie: nog geen munten toegekend

        // Iedereen begint met een willekeurig dier; in de wachtkamer kun je een ander kiezen.
        const startDier = willekeurigDier();

        return db.ref('sessies/' + code + '/spelers/' + huidigeSpelerId)
          .set({ naam: naam, dier: startDier, score: 0, totaleReactietijd: 0 })
          .then(() => {
            huidigeStatusSpeler = 'wachtkamer';
            kiezerTab = 'dieren';
            bouwKiezer();
            toonGekozenPoppetje({ dier: startDier });
            document.getElementById('speler-wachtkamer-naam').textContent = naam;
            document.getElementById('input-code').value = '';
            toonScherm('scherm-speler-wachtkamer');
            luisterNaarSessie(code);
          });
      });
    })
    .catch(err => {
      foutmelding.textContent = 'Er ging iets mis: ' + err.message;
    });
});

document.getElementById('btn-speler-verlaat-wachtkamer').addEventListener('click', () => {
  if (huidigeSessieCode && huidigeSpelerId) {
    db.ref('sessies/' + huidigeSessieCode + '/spelers/' + huidigeSpelerId).remove();
  }
  stopSessieListener();
  huidigeRol = null;
  toonScherm('scherm-algemeen');
});

document.getElementById('btn-speler-terug-naar-start').addEventListener('click', () => {
  stopSessieListener();
  huidigeRol = null;
  toonScherm('scherm-algemeen');
});

document.getElementById('btn-speler-verwijderd-terug').addEventListener('click', () => {
  toonScherm('scherm-algemeen');
});

document.getElementById('btn-speler-host-weg-terug').addEventListener('click', () => {
  toonScherm('scherm-algemeen');
});

function renderSessieVoorSpeler(sessie) {
  const spelers = sessie.spelers || {};
  huidigeStatusSpeler = sessie.status;

  if (huidigeSpelerId && !spelers[huidigeSpelerId]) {
    // De host heeft deze speler uit de sessie verwijderd.
    stopSessieListener();
    huidigeRol = null;
    toonScherm('scherm-speler-verwijderd');
    return;
  }

  if (sessie.status === 'wachtkamer') {
    toonGekozenPoppetje(spelers[huidigeSpelerId]);
    toonScherm('scherm-speler-wachtkamer');
  }

  if (sessie.status === 'vraag') {
    if (sessie.huidigeVraagIndex !== laatstGetoondeVraagIndexSpeler) {
      laatstGetoondeVraagIndexSpeler = sessie.huidigeVraagIndex;
      vraagGetoondOpSpeler = Date.now();
      spelerHeeftGeantwoord = false;
      spelerGeselecteerdeAntwoorden = [];
    }

    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    const eigenAntwoorden = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const eigenAntwoord = eigenAntwoorden[huidigeSpelerId];

    if (eigenAntwoord) {
      // Al geantwoord: alleen een groot laadteken. Of het goed was, ziet de
      // speler pas als de quizmaster doorklikt (status 'resultaat').
      toonScherm('scherm-speler-antwoord-verzonden');
    } else {
      document.getElementById('speler-voortgang-weergave').textContent =
        'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length +
        ' · ' + vraag.punten + (vraag.punten === 1 ? ' punt' : ' punten');
      document.getElementById('speler-vraag-weergave').textContent = vraag.vraag;
      toonVraagFoto('speler-vraag-foto', vraag.afbeelding);

      // Bij precies 1 goed antwoord werkt het net als vroeger: 1 tik = meteen
      // versturen. Alleen als er meerdere antwoorden goed kunnen zijn, moet de
      // speler eerst aanvinken en daarna bewust op "Antwoord versturen" klikken
      // (anders is het niet uit te drukken welke combinatie bedoeld is).
      const meerdereGoedMogelijk = vraag.goedAntwoorden.length > 1;

      const verstuurKnop = document.getElementById('btn-speler-antwoord-versturen');
      const instructieEl = document.getElementById('speler-vraag-instructie');
      const antwoordenEl = document.getElementById('speler-antwoorden-weergave');
      antwoordenEl.innerHTML = '';

      const verstuurAntwoord = (indexen) => {
        if (spelerHeeftGeantwoord || huidigeStatusSpeler !== 'vraag') return;
        spelerHeeftGeantwoord = true;
        const reactietijdMs = Date.now() - vraagGetoondOpSpeler;
        db.ref('sessies/' + huidigeSessieCode + '/antwoorden/' + sessie.huidigeVraagIndex + '/' + huidigeSpelerId)
          .set({ antwoordIndexen: indexen, reactietijdMs: reactietijdMs });
      };

      if (meerdereGoedMogelijk) {
        instructieEl.textContent = 'Tik op alle antwoorden die je goed denkt dat zijn en klik daarna op "Antwoord versturen".';
        verstuurKnop.style.display = '';
        verstuurKnop.disabled = spelerGeselecteerdeAntwoorden.length === 0;

        vraag.antwoorden.forEach((tekst, index) => {
          const antwoordIndex = index + 1;
          const optie = document.createElement('div');
          optie.className = 'antwoord-optie' + (spelerGeselecteerdeAntwoorden.includes(antwoordIndex) ? ' geselecteerd' : '');
          optie.textContent = tekst;

          optie.addEventListener('click', () => {
            if (spelerHeeftGeantwoord) return;

            const positie = spelerGeselecteerdeAntwoorden.indexOf(antwoordIndex);
            if (positie === -1) {
              spelerGeselecteerdeAntwoorden.push(antwoordIndex);
            } else {
              spelerGeselecteerdeAntwoorden.splice(positie, 1);
            }
            optie.classList.toggle('geselecteerd');
            verstuurKnop.disabled = spelerGeselecteerdeAntwoorden.length === 0;
          });

          antwoordenEl.appendChild(optie);
        });

        verstuurKnop.onclick = () => {
          if (spelerGeselecteerdeAntwoorden.length === 0) return;
          verstuurAntwoord(spelerGeselecteerdeAntwoorden.slice());
        };
      } else {
        instructieEl.textContent = 'Tik op het antwoord dat je goed denkt dat is.';
        verstuurKnop.style.display = 'none';
        verstuurKnop.onclick = null;

        vraag.antwoorden.forEach((tekst, index) => {
          const antwoordIndex = index + 1;
          const optie = document.createElement('div');
          optie.className = 'antwoord-optie';
          optie.textContent = tekst;

          optie.addEventListener('click', () => {
            verstuurAntwoord([antwoordIndex]);
          });

          antwoordenEl.appendChild(optie);
        });
      }

      toonScherm('scherm-speler-vraag');
    }
  }

  if (sessie.status === 'resultaat') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    const antwoordenVraag = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const eigenAntwoord = antwoordenVraag[huidigeSpelerId];
    const resultaatEl = document.getElementById('speler-resultaat-tekst');

    if (!eigenAntwoord) {
      resultaatEl.className = 'groot-resultaat fout';
      resultaatEl.textContent = 'Geen antwoord ✗';
    } else if (setsGelijk(eigenAntwoord.antwoordIndexen || [], vraag.goedAntwoorden)) {
      resultaatEl.className = 'groot-resultaat goed';
      resultaatEl.textContent = 'Goed! ✔';
    } else {
      resultaatEl.className = 'groot-resultaat fout';
      resultaatEl.textContent = 'Fout ✗';
    }

    renderGroteAntwoorden('speler', vraag);
    toonScherm('scherm-speler-resultaat');
  }

  if (sessie.status === 'scorebord' || sessie.status === 'afgelopen') {
    document.getElementById('speler-scorebord-titel').textContent =
      sessie.status === 'afgelopen' ? 'Eindstand 🏆' : 'Scorebord';

    let scorebordBericht = sessie.status === 'afgelopen' ? 'Bedankt voor het meespelen!' : '';

    // Won je deze live quiz? Dan krijg je eenmalig munten (voor de winkel).
    if (sessie.status === 'afgelopen' && muntenToegekendVoorSessie !== huidigeSessieCode) {
      muntenToegekendVoorSessie = huidigeSessieCode;
      const eindstand = Object.entries(spelers || {}).sort((a, b) => {
        const scoreA = a[1].score || 0, scoreB = b[1].score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (a[1].totaleReactietijd || 0) - (b[1].totaleReactietijd || 0);
      });
      const mijnPlek = eindstand.findIndex(regel => regel[0] === huidigeSpelerId);
      if (mijnPlek !== -1 && mijnPlek < MUNTEN_LIVE_PER_PLEK.length) {
        const verdiend = MUNTEN_LIVE_PER_PLEK[mijnPlek];
        geefMunten(verdiend);
        const medaille = ['🥇', '🥈', '🥉'][mijnPlek];
        scorebordBericht = medaille + ' Je bent ' + (mijnPlek + 1) + 'e geworden: +' + verdiend + ' munten! Bekijk de winkel voor mysterieboxen.';
      }
    }
    document.getElementById('speler-scorebord-bericht').textContent = scorebordBericht;

    renderScorebordLijst('speler-scorebord-lijst', spelers, huidigeSpelerId);

    const scorebordStatusEl = document.getElementById('speler-scorebord-status');
    if (sessie.status === 'afgelopen') {
      scorebordStatusEl.classList.remove('laad-rij');
      scorebordStatusEl.textContent = '';
    } else {
      scorebordStatusEl.classList.add('laad-rij');
      scorebordStatusEl.innerHTML = '<span class="laad-spinner"></span>Wacht tot de quizmaster verdergaat...';
    }

    document.getElementById('btn-speler-terug-naar-start').style.display =
      sessie.status === 'afgelopen' ? 'block' : 'none';

    toonScherm('scherm-speler-scorebord');
  }
}

// ================================================================
//  SPELEN: met mensen (live, met quizmaster) of zonder mensen (alleen)
// ================================================================

function isEigenQuizCode(code) {
  try {
    return JSON.parse(localStorage.getItem('eigenQuizzen') || '[]').some(q => q.code === code);
  } catch (e) {
    return false;
  }
}

const speelKeuzeOverlayEl = document.getElementById('speelkeuze-overlay');
const btnSpeelKeuzeAlleenEl = document.getElementById('btn-speelkeuze-alleen');
const speelKeuzeAlleenUitlegEl = document.getElementById('speelkeuze-alleen-uitleg');
const SPEELKEUZE_ALLEEN_STANDAARD_UITLEG = 'Speel de quiz zelf, zonder quizmaster.';

let speelKeuze = null; // { code, terugScherm }

function toonSpeelKeuze(code, titel, soloToegestaan, terugScherm) {
  speelKeuze = { code: code, terugScherm: terugScherm };
  document.getElementById('speelkeuze-quiztitel').textContent = titel || '';

  btnSpeelKeuzeAlleenEl.disabled = !soloToegestaan;
  speelKeuzeAlleenUitlegEl.textContent = soloToegestaan
    ? SPEELKEUZE_ALLEEN_STANDAARD_UITLEG
    : 'De maker heeft niet toegestaan dat je deze quiz alleen speelt.';

  speelKeuzeOverlayEl.classList.add('actief');
}

function sluitSpeelKeuze() {
  speelKeuzeOverlayEl.classList.remove('actief');
}

document.getElementById('btn-speelkeuze-mensen').addEventListener('click', () => {
  if (!speelKeuze) return;
  const code = speelKeuze.code;
  sluitSpeelKeuze();
  startHostenVanQuiz(code);
});

btnSpeelKeuzeAlleenEl.addEventListener('click', () => {
  if (!speelKeuze || btnSpeelKeuzeAlleenEl.disabled) return;
  const { code, terugScherm } = speelKeuze;
  sluitSpeelKeuze();
  startSoloVanQuiz(code, terugScherm);
});

document.getElementById('btn-speelkeuze-annuleren').addEventListener('click', sluitSpeelKeuze);

// Klik naast het venster (op de donkere achtergrond) sluit het ook.
speelKeuzeOverlayEl.addEventListener('click', (e) => {
  if (e.target === speelKeuzeOverlayEl) sluitSpeelKeuze();
});

// ---------- Alleen spelen (zonder quizmaster, niets hiervan gaat via Firebase-sessies) ----------

let soloCode = null;
let soloTitel = '';
let soloVragen = [];
let soloIndex = 0;
let soloAantalGoed = 0;
let soloTerugScherm = 'scherm-speelbare-quizzen';
let soloHeeftGeantwoord = false;
let soloGeselecteerdeAntwoorden = [];

function startSoloVanQuiz(code, terugScherm) {
  db.ref('quizzen/' + code).once('value').then(snapshot => {
    const quizData = snapshot.val();
    if (!quizData) {
      alert('Deze quiz kon niet gevonden worden (misschien is hij verwijderd).');
      return;
    }
    // Nog een keer controleren (de maker kan het net hebben uitgezet).
    if (quizData.soloToegestaan === false && !isEigenQuizCode(code)) {
      alert('De maker heeft niet toegestaan dat deze quiz alleen gespeeld wordt.');
      return;
    }

    const vragen = (quizData.vragen || []).map(normaliseerVraag);
    if (vragen.length === 0) {
      alert('Deze quiz heeft geen vragen.');
      return;
    }

    soloCode = code;
    soloTitel = quizData.titel || '';
    soloVragen = vragen;
    soloIndex = 0;
    soloAantalGoed = 0;
    soloTerugScherm = terugScherm || 'scherm-speelbare-quizzen';
    toonSoloVraag();
  }).catch(err => {
    alert('Quiz starten mislukt: ' + err.message);
  });
}

function toonSoloVraag() {
  const vraag = soloVragen[soloIndex];
  soloHeeftGeantwoord = false;
  soloGeselecteerdeAntwoorden = [];

  document.getElementById('solo-voortgang').textContent =
    'Vraag ' + (soloIndex + 1) + ' van ' + soloVragen.length;
  document.getElementById('solo-vraag-weergave').textContent = vraag.vraag;
  toonVraagFoto('solo-vraag-foto', vraag.afbeelding);

  const meerdereGoedMogelijk = vraag.goedAntwoorden.length > 1;
  const verstuurKnop = document.getElementById('btn-solo-antwoord-versturen');
  const instructieEl = document.getElementById('solo-vraag-instructie');
  const antwoordenEl = document.getElementById('solo-antwoorden-weergave');
  antwoordenEl.innerHTML = '';

  if (meerdereGoedMogelijk) {
    instructieEl.textContent = 'Tik op alle antwoorden die je goed denkt dat zijn en klik daarna op "Antwoord versturen".';
    verstuurKnop.style.display = '';
    verstuurKnop.disabled = true;

    vraag.antwoorden.forEach((tekst, index) => {
      const antwoordIndex = index + 1;
      const optie = document.createElement('div');
      optie.className = 'antwoord-optie';
      optie.textContent = tekst;
      optie.addEventListener('click', () => {
        if (soloHeeftGeantwoord) return;
        const positie = soloGeselecteerdeAntwoorden.indexOf(antwoordIndex);
        if (positie === -1) {
          soloGeselecteerdeAntwoorden.push(antwoordIndex);
        } else {
          soloGeselecteerdeAntwoorden.splice(positie, 1);
        }
        optie.classList.toggle('geselecteerd');
        verstuurKnop.disabled = soloGeselecteerdeAntwoorden.length === 0;
      });
      antwoordenEl.appendChild(optie);
    });

    verstuurKnop.onclick = () => {
      if (soloGeselecteerdeAntwoorden.length === 0) return;
      verstuurSoloAntwoord(soloGeselecteerdeAntwoorden.slice());
    };
  } else {
    instructieEl.textContent = 'Tik op het antwoord dat je goed denkt dat is.';
    verstuurKnop.style.display = 'none';
    verstuurKnop.onclick = null;

    vraag.antwoorden.forEach((tekst, index) => {
      const optie = document.createElement('div');
      optie.className = 'antwoord-optie';
      optie.textContent = tekst;
      optie.addEventListener('click', () => {
        verstuurSoloAntwoord([index + 1]);
      });
      antwoordenEl.appendChild(optie);
    });
  }

  toonScherm('scherm-solo-vraag');
}

function verstuurSoloAntwoord(indexen) {
  if (soloHeeftGeantwoord) return;
  soloHeeftGeantwoord = true;

  const vraag = soloVragen[soloIndex];
  const goed = setsGelijk(indexen, vraag.goedAntwoorden);
  if (goed) soloAantalGoed++;

  const resultaatEl = document.getElementById('solo-resultaat-tekst');
  resultaatEl.className = 'groot-resultaat ' + (goed ? 'goed' : 'fout');
  resultaatEl.textContent = goed ? 'Goed! ✔' : 'Fout ✗';
  renderGroteAntwoorden('solo', vraag);

  const isLaatsteVraag = soloIndex + 1 >= soloVragen.length;
  document.getElementById('btn-solo-volgende').textContent =
    isLaatsteVraag ? 'Bekijk resultaat' : 'Volgende vraag';

  toonScherm('scherm-solo-resultaat');
}

document.getElementById('btn-solo-volgende').addEventListener('click', () => {
  if (soloIndex + 1 < soloVragen.length) {
    soloIndex++;
    toonSoloVraag();
  } else {
    toonSoloEinde();
  }
});

function toonSoloEinde() {
  const totaal = soloVragen.length;
  const OMTREK = 377; // zelfde als stroke-dasharray in de CSS
  const fractie = totaal > 0 ? soloAantalGoed / totaal : 0;

  document.getElementById('solo-einde-titel').textContent = soloTitel;

  let kop;
  if (soloAantalGoed === totaal) {
    kop = '🏆 Perfect!';
  } else if (soloAantalGoed * 2 >= totaal) {
    kop = '👏 Goed gedaan!';
  } else {
    kop = '💪 Blijf oefenen!';
  }
  document.getElementById('solo-einde-kop').textContent = kop;

  const ringEl = document.getElementById('solo-einde-ring');
  ringEl.style.setProperty('--doel', String(Math.round(OMTREK * (1 - fractie))));
  ringEl.classList.toggle('leeg', soloAantalGoed === 0);

  document.getElementById('solo-einde-aantal').textContent = soloAantalGoed + '/' + totaal;
  let eindTekst = 'Je had ' + soloAantalGoed + ' van de ' + totaal + (totaal === 1 ? ' vraag' : ' vragen') + ' goed';
  if (totaal > 0 && soloAantalGoed === totaal) {
    geefMunten(MUNTEN_SOLO_ALLES_GOED);
    eindTekst += ' — 🎉 +' + MUNTEN_SOLO_ALLES_GOED + ' munten!';
  }
  document.getElementById('solo-einde-tekst').textContent = eindTekst;

  toonScherm('scherm-solo-einde');
}

function verlaatSoloQuiz() {
  soloVragen = [];
  toonScherm('scherm-algemeen');
}

document.getElementById('btn-solo-stoppen').addEventListener('click', verlaatSoloQuiz);
document.getElementById('btn-solo-terug').addEventListener('click', verlaatSoloQuiz);

document.getElementById('btn-solo-opnieuw').addEventListener('click', () => {
  soloIndex = 0;
  soloAantalGoed = 0;
  toonSoloVraag();
});


// ================================================================
// SITEBEHEER: al eerder gemaakte eigen poppetjes/accessoires laden
// ----------------------------------------------------------------
// Poppetjes maken uit een emoji kan niet meer (er zijn nu genoeg vaste dieren
// en accessoires). Wat eerder gemaakt is en in Firebase staat, blijft gewoon
// werken en wordt hier nog geladen.
// ================================================================

function laadAangepasteCatalogus() {
  return db.ref('aangepastePoppetjes').once('value').then(snapshot => {
    Object.keys(AANGEPASTE_POPPETJES).forEach(k => verwijderAangepastPoppetjeUitCatalogus(k));
    Object.keys(AANGEPASTE_ACCESSOIRES).forEach(k => verwijderAangepastAccessoireUitCatalogus(k));
    const data = snapshot.val() || {};
    Object.entries(data.dieren || {}).forEach(([id,item]) => registreerAangepastPoppetje(id,item));
    Object.entries(data.accessoires || {}).forEach(([id,item]) => registreerAangepastAccessoire(id,item));
  }).catch(() => {});
}

bouwKiezer();
laadAangepasteCatalogus().then(() => { bouwKiezer(); bouwVerzamelingKiezer(); werkMuntenWeergaveBij(); werkProfielBadgeBij(); });
werkMuntenWeergaveBij();

// ---------- Bij het openen van de site: naam bij eigen quizzen zetten ----------
koppelMakerNaamAanEigenQuizzen();

// ---------- Profiel: badge, slotjes op de vakken en het profiel-overlay ----------

// Zet een 🔒 op de vakken die pas werken met een profiel, zolang er nog
// geen profiel is aangemaakt.
function werkVakSlotjesBij() {
  const opSlot = !heeftProfiel();
  ['btn-naar-quizmaken', 'btn-naar-winkel', 'btn-naar-dierentuin', 'btn-naar-wiel'].forEach(id => {
    document.getElementById(id).classList.toggle('vak-op-slot', opSlot);
  });
  document.getElementById('profiel-vereist-hint').style.display = opSlot ? '' : 'none';
}

const PROFIEL_ACCESSOIRES_SLEUTEL = 'profielAccessoires';

function huidigeProfielAccessoires() {
  try {
    return geldigeAccessoires(JSON.parse(localStorage.getItem(PROFIEL_ACCESSOIRES_SLEUTEL) || '{}'));
  } catch (e) {
    return {};
  }
}

function slaProfielAccessoiresOp(accessoires) {
  localStorage.setItem(PROFIEL_ACCESSOIRES_SLEUTEL, JSON.stringify(geldigeAccessoires(accessoires)));
}

function profielPoppetjeHtml() {
  const dier = geldigDier(huidigProfielDier());
  if (!dier) return '';
  return poppetjeSvg(dier, huidigeProfielAccessoires());
}

function werkProfielPoppetjeWeergaveBij() {
  const overlayPoppetjeEl = document.getElementById('profiel-overlay-poppetje');
  const badgePoppetjeEl = document.getElementById('profiel-badge-poppetje');

  if (heeftProfiel() && geldigDier(huidigProfielDier())) {
    const svg = profielPoppetjeHtml();
    overlayPoppetjeEl.innerHTML = svg;
    badgePoppetjeEl.innerHTML = svg;
  } else {
    overlayPoppetjeEl.innerHTML = '';
    badgePoppetjeEl.innerHTML = '';
  }
}

// Werkt de badge rechtsboven bij.
// Met een bestaand profiel zie je hier alleen je poppetje/gezichtje.
function werkProfielBadgeBij() {
  const poppetjeEl = document.getElementById('profiel-badge-poppetje');
  const tekstEl = document.getElementById('profiel-badge-tekst');

  if (heeftProfiel()) {
    tekstEl.textContent = '';
    werkProfielPoppetjeWeergaveBij();
  } else {
    poppetjeEl.innerHTML = '';
    tekstEl.textContent = '👤 Profiel maken';
  }
}

const profielOverlayEl = document.getElementById('profiel-overlay');
const btnProfielPoppetjeWijzigenEl = document.getElementById('btn-profiel-poppetje-wijzigen');
const profielOverlayKiezerEl = document.getElementById('profiel-overlay-dieren-kiezer');

let profielKiezerTab = 'dieren';

function sluitProfielPoppetjeKiezer() {
  profielOverlayKiezerEl.style.display = 'none';
  profielOverlayKiezerEl.innerHTML = '';
  btnProfielPoppetjeWijzigenEl.textContent = '🔁 Poppetje wijzigen';
}

function werkProfielKiezerTabsBij(containerEl) {
  containerEl.querySelectorAll('.profiel-kiezer-tab').forEach(tab => {
    const actief = tab.dataset.tab === profielKiezerTab;
    tab.classList.toggle('actief', actief);
    tab.setAttribute('aria-selected', String(actief));
  });
}

function bouwProfielKiezer() {
  profielOverlayKiezerEl.innerHTML = '';
  profielOverlayKiezerEl.classList.add('profiel-dieren-kiezer');
  profielOverlayKiezerEl.classList.toggle('accessoires', profielKiezerTab === 'accessoires');

  const tabs = document.createElement('div');
  tabs.className = 'profiel-kiezer-tabs';
  tabs.setAttribute('role', 'tablist');

  const dierenTab = document.createElement('button');
  dierenTab.type = 'button';
  dierenTab.className = 'profiel-kiezer-tab';
  dierenTab.dataset.tab = 'dieren';
  dierenTab.textContent = '🐶 Dieren';
  dierenTab.setAttribute('role', 'tab');
  dierenTab.addEventListener('click', () => {
    profielKiezerTab = 'dieren';
    bouwProfielKiezer();
  });

  const accessoiresTab = document.createElement('button');
  accessoiresTab.type = 'button';
  accessoiresTab.className = 'profiel-kiezer-tab';
  accessoiresTab.dataset.tab = 'accessoires';
  accessoiresTab.textContent = '🎩 Accessoires';
  accessoiresTab.setAttribute('role', 'tab');
  accessoiresTab.addEventListener('click', () => {
    profielKiezerTab = 'accessoires';
    bouwProfielKiezer();
  });

  tabs.appendChild(dierenTab);
  tabs.appendChild(accessoiresTab);
  profielOverlayKiezerEl.appendChild(tabs);
  werkProfielKiezerTabsBij(tabs);

  const bezitDieren = haalBezitDieren();
  const bezitAccessoires = haalBezitAccessoires();
  const huidigDier = geldigDier(huidigProfielDier()) || bezitDieren[0] || DIEREN[0];
  const huidigeAccessoires = huidigeProfielAccessoires();

  if (profielKiezerTab === 'dieren') {
    bezitDieren.forEach(dier => {
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'dier-knop';
      knop.innerHTML = poppetjeSvg(dier, huidigeAccessoires);
      knop.dataset.dier = dier;
      knop.classList.toggle('gekozen', dier === huidigDier);
      knop.setAttribute('aria-label', 'Kies ' + dier + ' als profielfoto');
      knop.addEventListener('click', () => {
        localStorage.setItem(PROFIEL_DIER_SLEUTEL, dier);
        werkProfielBadgeBij();
        werkProfielPoppetjeWeergaveBij();
        bouwProfielKiezer();
      });
      profielOverlayKiezerEl.appendChild(knop);
    });
  } else {
    ACCESSOIRE_GROEPEN.forEach(groep => {
      const items = groep.items.filter(item => bezitAccessoires.indexOf(item) !== -1);
      if (!items.length) return;

      const kop = document.createElement('div');
      kop.className = 'kiezer-groep-titel';
      kop.textContent = groep.titel;
      profielOverlayKiezerEl.appendChild(kop);

      items.forEach(emoji => {
        const voorbeeld = {};
        voorbeeld[groep.plek] = emoji;

        const knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'dier-knop';
        knop.innerHTML = poppetjeSvg(huidigDier, voorbeeld);
        knop.dataset.plek = groep.plek;
        knop.dataset.acc = emoji;
        knop.classList.toggle('gekozen', huidigeAccessoires[groep.plek] === emoji);
        knop.setAttribute('aria-label', 'Kies ' + ((ACCESSOIRES[emoji] && ACCESSOIRES[emoji].naam) || 'accessoire'));

        knop.addEventListener('click', () => {
          const acc = Object.assign({}, huidigeProfielAccessoires());
          if (acc[groep.plek] === emoji) {
            delete acc[groep.plek];
          } else {
            acc[groep.plek] = emoji;
          }
          slaProfielAccessoiresOp(acc);
          werkProfielBadgeBij();
          werkProfielPoppetjeWeergaveBij();
          bouwProfielKiezer();
        });

        profielOverlayKiezerEl.appendChild(knop);
      });
    });

    const wegKnop = document.createElement('button');
    wegKnop.type = 'button';
    wegKnop.className = 'kiezer-weg-knop';
    wegKnop.textContent = 'Alle accessoires weghalen';
    wegKnop.addEventListener('click', () => {
      slaProfielAccessoiresOp({});
      werkProfielBadgeBij();
      werkProfielPoppetjeWeergaveBij();
      bouwProfielKiezer();
    });
    profielOverlayKiezerEl.appendChild(wegKnop);
  }

  if (!bezitDieren.length) {
    const hint = document.createElement('p');
    hint.className = 'kiezer-hint';
    hint.textContent = 'Je hebt nog geen poppetje om te kiezen.';
    profielOverlayKiezerEl.appendChild(hint);
  }
}

btnProfielPoppetjeWijzigenEl.addEventListener('click', () => {
  const isOpen = profielOverlayKiezerEl.style.display !== 'none';

  if (isOpen) {
    sluitProfielPoppetjeKiezer();
    return;
  }

  profielKiezerTab = 'dieren';
  bouwProfielKiezer();
  profielOverlayKiezerEl.style.display = '';
  btnProfielPoppetjeWijzigenEl.textContent = 'Kiezer sluiten';
});

document.getElementById('btn-profiel-badge').addEventListener('click', () => {
  if (heeftProfiel()) {
    document.getElementById('profiel-overlay-naam').textContent = 'Ingelogd als ' + huidigeMakerNaam();
    werkProfielPoppetjeWeergaveBij();
    sluitProfielPoppetjeKiezer();
    profielOverlayEl.classList.add('actief');
  } else {
    naProfielActie = null;
    openProfielMakenScherm();
  }
});

document.getElementById('btn-profiel-overlay-sluiten').addEventListener('click', () => {
  profielOverlayEl.classList.remove('actief');
  sluitProfielPoppetjeKiezer();
});

werkProfielBadgeBij();
werkVakSlotjesBij();



// ================================================================
// VRIENDEN, CHAT EN DUBBELE VERZAMELING
// ================================================================

const BEZIT_AANTALLEN_SLEUTEL = 'quizAppBezitAantallen';
const SOCIAAL_PROFIEL_PAD = 'gebruikers';

function normaliseerGebruikersnaam(naam) {
  return String(naam || '').trim().toLowerCase().replace(/\\s+/g, ' ');
}

function profielFirebaseGebruiker() {
  return typeof auth !== 'undefined' ? auth.currentUser : null;
}

function huidigeBezitAantallen() {
  let data = {};
  try { data = JSON.parse(localStorage.getItem(BEZIT_AANTALLEN_SLEUTEL) || '{}') || {}; } catch (e) {}
  const dieren = haalBezitDierenBasisVoorAantal();
  const accessoires = haalBezitAccessoiresBasisVoorAantal();
  dieren.forEach(item => { if (!Number.isInteger(data['dier:' + item]) || data['dier:' + item] < 1) data['dier:' + item] = 1; });
  accessoires.forEach(item => { if (!Number.isInteger(data['accessoire:' + item]) || data['accessoire:' + item] < 1) data['accessoire:' + item] = 1; });
  return data;
}

function haalBezitDierenBasisVoorAantal() {
  const opgeslagen = JSON.parse(localStorage.getItem(BEZIT_DIEREN_SLEUTEL) || 'null');
  return Array.isArray(opgeslagen) && opgeslagen.length ? opgeslagen : STANDAARD_DIEREN.slice();
}

function haalBezitAccessoiresBasisVoorAantal() {
  const opgeslagen = JSON.parse(localStorage.getItem(BEZIT_ACCESSOIRES_SLEUTEL) || 'null');
  return Array.isArray(opgeslagen) && opgeslagen.length ? opgeslagen : STANDAARD_ACCESSOIRES.slice();
}

function slaBezitAantallenOp(data) {
  localStorage.setItem(BEZIT_AANTALLEN_SLEUTEL, JSON.stringify(data || {}));
}

function aantalVan(type, item) {
  const data = huidigeBezitAantallen();
  return Math.max(0, Number(data[type + ':' + item] || 0));
}

function pasAantalAan(type, item, delta) {
  const data = huidigeBezitAantallen();
  const sleutel = type + ':' + item;
  const nieuw = Math.max(0, (Number(data[sleutel]) || 0) + delta);
  if (nieuw > 0) data[sleutel] = nieuw;
  else delete data[sleutel];
  slaBezitAantallenOp(data);
  return nieuw;
}

function onlineBezitObject() {
  const data = huidigeBezitAantallen();
  const dieren = {};
  const accessoires = {};
  Object.keys(data).forEach(k => {
    const [type, ...rest] = k.split(':');
    const item = rest.join(':');
    if (type === 'dier') dieren[item] = data[k];
    if (type === 'accessoire') accessoires[item] = data[k];
  });
  return { dieren, accessoires };
}

function syncSociaalBezit() {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker || !heeftProfiel()) return Promise.resolve();
  return db.ref(SOCIAAL_PROFIEL_PAD + '/' + gebruiker.uid + '/bezit').set(onlineBezitObject()).catch(() => {});
}

function registreerSociaalProfiel() {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker || !heeftProfiel()) return Promise.resolve();
  const naam = huidigeMakerNaam();
  const zoeknaam = normaliseerGebruikersnaam(naam);
  const dier = geldigDier(huidigProfielDier()) || '';
  const accessoires = huidigeProfielAccessoires ? huidigeProfielAccessoires() : {};
  const naamRef = db.ref('gebruikersnamen/' + encodeURIComponent(zoeknaam));
  return naamRef.transaction(v => v || gebruiker.uid).then(result => {
    const eigenaar = result.snapshot.val();
    if (eigenaar && eigenaar !== gebruiker.uid) {
      throw new Error('Deze gebruikersnaam is al in gebruik.');
    }
    return db.ref(SOCIAAL_PROFIEL_PAD + '/' + gebruiker.uid).update({
      gebruikersnaam: naam,
      gebruikersnaamZoek: zoeknaam,
      dier: dier,
      accessoires: accessoires,
      laatstOnline: firebase.database.ServerValue.TIMESTAMP
    });
  }).then(() => syncSociaalBezit()).catch(err => {
    if (err && err.message === 'Deze gebruikersnaam is al in gebruik.') {
      alert(err.message + ' Kies een andere naam.');
    }
  });
}

function laadOnlineBezitVoorEigenProfiel() {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker || !heeftProfiel()) return;
  db.ref(SOCIAAL_PROFIEL_PAD + '/' + gebruiker.uid + '/bezit').on('value', snap => {
    const data = snap.val();
    if (!data) { syncSociaalBezit(); return; }
    const aantallen = {};
    const dieren = [];
    const accessoires = [];
    Object.entries(data.dieren || {}).forEach(([item, aantal]) => {
      if (geldigDier(item) && Number(aantal) > 0) { dieren.push(item); aantallen['dier:' + item] = Number(aantal); }
    });
    Object.entries(data.accessoires || {}).forEach(([item, aantal]) => {
      if (ACCESSOIRES[item] && Number(aantal) > 0) { accessoires.push(item); aantallen['accessoire:' + item] = Number(aantal); }
    });
    if (dieren.length) localStorage.setItem(BEZIT_DIEREN_SLEUTEL, JSON.stringify(dieren));
    if (accessoires.length) localStorage.setItem(BEZIT_ACCESSOIRES_SLEUTEL, JSON.stringify(accessoires));
    if (Object.keys(aantallen).length) slaBezitAantallenOp(aantallen);
    werkMuntenWeergaveBij();
    bouwVerzamelingKiezer();
  }).catch(() => {});
}

function laadSocialeGegevens() {
  if (!auth || !auth.currentUser) return;
  if (heeftProfiel()) {
    registreerSociaalProfiel();
    laadOnlineBezitVoorEigenProfiel();
    laadVriendenEnVerzoeken();
  }
}

// Overridden inventory getters: dezelfde API als de oude code, maar nu met
// unieke items in de lijst en aantallen apart opgeslagen.
function haalBezitDieren() { return haalBezitDierenBasisVoorAantal(); }
function haalBezitAccessoires() { return haalBezitAccessoiresBasisVoorAantal(); }

function voegBezitToe(dieren, accessoires) {
  const aantallen = huidigeBezitAantallen();
  const huidigeDieren = haalBezitDierenBasisVoorAantal();
  const huidigeAccessoires = haalBezitAccessoiresBasisVoorAantal();
  (dieren || []).forEach(d => {
    if (!geldigDier(d)) return;
    if (huidigeDieren.indexOf(d) === -1) huidigeDieren.push(d);
    const sleutel = 'dier:' + d;
    aantallen[sleutel] = (Number(aantallen[sleutel]) || 0) + 1;
  });
  (accessoires || []).forEach(a => {
    if (!ACCESSOIRES[a]) return;
    if (huidigeAccessoires.indexOf(a) === -1) huidigeAccessoires.push(a);
    const sleutel = 'accessoire:' + a;
    aantallen[sleutel] = (Number(aantallen[sleutel]) || 0) + 1;
  });
  localStorage.setItem(BEZIT_DIEREN_SLEUTEL, JSON.stringify(huidigeDieren));
  localStorage.setItem(BEZIT_ACCESSOIRES_SLEUTEL, JSON.stringify(huidigeAccessoires));
  slaBezitAantallenOp(aantallen);
  syncSociaalBezit();
  werkMuntenWeergaveBij();
  bouwVerzamelingKiezer();
}

function verwijderEenUitBezit(type, item) {
  const aantallen = huidigeBezitAantallen();
  const sleutel = type + ':' + item;
  const nieuw = Math.max(0, (Number(aantallen[sleutel]) || 0) - 1);
  if (nieuw > 0) aantallen[sleutel] = nieuw;
  else delete aantallen[sleutel];
  if (type === 'dier') {
    const lijst = haalBezitDierenBasisVoorAantal().filter(x => x !== item);
    if (nieuw > 0) lijst.push(item);
    localStorage.setItem(BEZIT_DIEREN_SLEUTEL, JSON.stringify([...new Set(lijst)]));
  } else {
    const lijst = haalBezitAccessoiresBasisVoorAantal().filter(x => x !== item);
    if (nieuw > 0) lijst.push(item);
    localStorage.setItem(BEZIT_ACCESSOIRES_SLEUTEL, JSON.stringify([...new Set(lijst)]));
  }
  slaBezitAantallenOp(aantallen);
  syncSociaalBezit();
}

function verkoopDier(dier) {
  const aantal = aantalVan('dier', dier);
  if (aantal <= 0) return;
  if (aantal === 1 && haalBezitDieren().length <= 1) { alert('Je kunt je laatste dier niet verkopen.'); return; }
  if (!confirm('Eén exemplaar van dit dier verkopen voor ' + VERKOOP_PRIJS + ' munten?')) return;
  verwijderEenUitBezit('dier', dier);
  geefMunten(VERKOOP_PRIJS);
  bouwVerzamelingKiezer();
}

function verkoopAccessoire(emoji) {
  const aantal = aantalVan('accessoire', emoji);
  if (aantal <= 0) return;
  if (aantal === 1 && haalBezitAccessoires().length <= 1) { alert('Je kunt je laatste accessoire niet verkopen.'); return; }
  const naam = ACCESSOIRES[emoji] ? ACCESSOIRES[emoji].naam : 'dit accessoire';
  if (!confirm('Eén exemplaar van "' + naam + '" verkopen voor ' + VERKOOP_PRIJS + ' munten?')) return;
  verwijderEenUitBezit('accessoire', emoji);
  geefMunten(VERKOOP_PRIJS);
  bouwVerzamelingKiezer();
}

function openVerzamelItemActies(type, item) {
  const aantal = aantalVan(type, item);
  if (!aantal) return;
  const titel = type === 'dier' ? item : ((ACCESSOIRES[item] && ACCESSOIRES[item].naam) || item);
  const naarVriend = prompt('Wat wil je doen met ' + titel + '?\\nTyp VERKOOP om 1 exemplaar te verkopen, of typ STUUR om 1 exemplaar naar een vriend te sturen.');
  if (!naarVriend) return;
  if (naarVriend.trim().toLowerCase() === 'verkoop') {
    type === 'dier' ? verkoopDier(item) : verkoopAccessoire(item);
  } else if (naarVriend.trim().toLowerCase() === 'stuur') {
    openVriendStuurOverlay(type, item);
  }
}

// Vervangt de verzameling-renderer zodat dubbele exemplaren zichtbaar zijn als 2, 3, ...
function bouwVerzamelingKiezer() {
  const kiezerEl = document.getElementById('verzameling-kiezer');
  if (!kiezerEl) return;
  kiezerEl.innerHTML = '';
  const opDieren = kiezerTabVerzameling === 'dieren';
  const bezit = opDieren ? haalBezitDieren() : haalBezitAccessoires();
  const catalogus = opDieren ? DIEREN : Object.keys(ACCESSOIRES);
  const aantallen = huidigeBezitAantallen();

  catalogus.forEach(item => {
    const heeft = bezit.indexOf(item) !== -1;
    const aantal = aantalVan(opDieren ? 'dier' : 'accessoire', item);
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'dier-knop verzameling-item' + (heeft ? ' in-bezit' : ' niet-in-bezit');
    if (opDieren) {
      knop.innerHTML = heeft ? poppetjeSvg(item, {}) : '<span class="verzameling-slot">🔒</span>';
    } else {
      const voorbeeldDier = huidigProfielDier() || bezit[0] || DIEREN[0];
      const acc = {};
      const groep = ACCESSOIRE_GROEPEN.find(g => g.items.indexOf(item) !== -1);
      if (groep) acc[groep.plek] = item;
      knop.innerHTML = heeft ? poppetjeSvg(voorbeeldDier, acc) : '<span class="verzameling-slot">🔒</span>';
    }
    if (heeft) {
      const badge = document.createElement('span');
      badge.className = 'dubbel-badge';
      badge.textContent = String(aantal);
      badge.title = aantal + ' exemplaar' + (aantal === 1 ? '' : 's');
      knop.appendChild(badge);
      knop.addEventListener('click', () => openVerzamelItemActies(opDieren ? 'dier' : 'accessoire', item));
      knop.title = aantal > 1 ? 'Klik: 1 verkopen of 1 naar een vriend sturen' : 'Klik: verkopen of naar een vriend sturen';
    }
    kiezerEl.appendChild(knop);
  });
}

// ---------------- Vrienden ----------------

let socialeVrienden = {};
let socialeVerzoeken = {};
let socialeZoekTimer = null;
let huidigChatUid = '';
let huidigChatNaam = '';

function chatIdVoor(a, b) { return [a, b].sort().join('_'); }

function veiligeChatTekst(tekst) { return String(tekst || '').trim().slice(0, 500); }

function laadVriendenEnVerzoeken() {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker || !heeftProfiel()) return;
  db.ref('vrienden/' + gebruiker.uid).on('value', snap => {
    socialeVrienden = snap.val() || {};
    renderVrienden();
  });
  db.ref('vriendschapsverzoeken/' + gebruiker.uid).on('value', snap => {
    socialeVerzoeken = snap.val() || {};
    renderVrienden();
  });
}

function zoekGebruikersOpNaam(zoekterm) {
  const q = normaliseerGebruikersnaam(zoekterm);
  const resultatenEl = document.getElementById('vrienden-zoekresultaten');
  if (!resultatenEl) return;
  if (q.length < 2) { resultatenEl.innerHTML = '<p class="subtitel">Typ minimaal 2 letters.</p>'; return; }
  resultatenEl.innerHTML = '<p class="subtitel">Zoeken...</p>';
  db.ref(SOCIAAL_PROFIEL_PAD).orderByChild('gebruikersnaamZoek').startAt(q).endAt(q + '\\uf8ff').limitToFirst(20).once('value').then(snap => {
    resultatenEl.innerHTML = '';
    const eigenUid = profielFirebaseGebruiker() && profielFirebaseGebruiker().uid;
    let gevonden = 0;
    snap.forEach(child => {
      const p = child.val() || {};
      if (child.key === eigenUid) return;
      gevonden++;
      const rij = document.createElement('div');
      rij.className = 'vriend-zoekresultaat';
      const pop = document.createElement('div');
      pop.className = 'vriend-mini-poppetje';
      if (geldigDier(p.dier)) pop.innerHTML = poppetjeSvg(p.dier, geldigeAccessoires(p.accessoires));
      const naam = document.createElement('strong');
      naam.textContent = p.gebruikersnaam || 'Onbekende gebruiker';
      const knop = document.createElement('button');
      knop.className = 'btn btn-secondary';
      knop.type = 'button';
      if (socialeVrienden[child.key]) {
        knop.textContent = '✓ Vriend';
        knop.disabled = true;
      } else if (socialeVerzoeken[child.key]) {
        knop.textContent = '✓ Verzoek gestuurd';
        knop.disabled = true;
      } else {
        knop.textContent = '➕ Vriendschapsverzoek';
        knop.addEventListener('click', () => stuurVriendschapsverzoek(child.key, p.gebruikersnaam || 'gebruiker'));
      }
      rij.append(pop, naam, knop);
      resultatenEl.appendChild(rij);
    });
    if (!gevonden) resultatenEl.innerHTML = '<p class="subtitel">Geen gebruiker gevonden.</p>';
  }).catch(() => { resultatenEl.innerHTML = '<p class="foutmelding">Zoeken lukt nu niet.</p>'; });
}

function stuurVriendschapsverzoek(toUid, naam) {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker) { alert('Je profiel is nog niet verbonden.'); return; }
  db.ref('vriendschapsverzoeken/' + toUid + '/' + gebruiker.uid).set({
    uid: gebruiker.uid,
    gebruikersnaam: huidigeMakerNaam(),
    naamOntvanger: naam,
    tijd: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('Vriendschapsverzoek verstuurd naar ' + naam + '.');
    zoekGebruikersOpNaam(document.getElementById('input-zoek-vrienden').value);
  }).catch(() => alert('Het vriendschapsverzoek kon niet worden verstuurd.'));
}

function accepteerVriendschapsverzoek(fromUid, verzoek) {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker) return;
  const updates = {};
  updates['vrienden/' + gebruiker.uid + '/' + fromUid] = { gebruikersnaam: verzoek.gebruikersnaam || 'Vriend', sinds: firebase.database.ServerValue.TIMESTAMP };
  updates['vrienden/' + fromUid + '/' + gebruiker.uid] = { gebruikersnaam: huidigeMakerNaam(), sinds: firebase.database.ServerValue.TIMESTAMP };
  updates['vriendschapsverzoeken/' + gebruiker.uid + '/' + fromUid] = null;
  db.ref().update(updates).catch(() => alert('Accepteren is mislukt.'));
}

function renderVrienden() {
  const lijst = document.getElementById('vrienden-lijst');
  const verzoeken = document.getElementById('vrienden-verzoeken');
  if (!lijst || !verzoeken) return;
  lijst.innerHTML = '';
  Object.entries(socialeVrienden).forEach(([uid, info]) => {
    const rij = document.createElement('div');
    rij.className = 'vriend-rij';
    const naam = document.createElement('strong');
    naam.textContent = info.gebruikersnaam || 'Vriend';
    const chat = document.createElement('button');
    chat.type = 'button'; chat.className = 'btn btn-secondary'; chat.textContent = '💬 Chat';
    chat.addEventListener('click', () => openChat(uid, info.gebruikersnaam || 'Vriend'));
    rij.append(naam, chat); lijst.appendChild(rij);
  });
  if (!Object.keys(socialeVrienden).length) lijst.innerHTML = '<p class="subtitel">Je hebt nog geen vrienden.</p>';

  verzoeken.innerHTML = '';
  Object.entries(socialeVerzoeken).forEach(([uid, verzoek]) => {
    const rij = document.createElement('div');
    rij.className = 'vriend-rij';
    const naam = document.createElement('strong');
    naam.textContent = verzoek.gebruikersnaam || 'Gebruiker';
    const knop = document.createElement('button');
    knop.type = 'button'; knop.className = 'btn btn-primary'; knop.textContent = '✓ Accepteren';
    knop.addEventListener('click', () => accepteerVriendschapsverzoek(uid, verzoek));
    rij.append(naam, knop); verzoeken.appendChild(rij);
  });
  if (!Object.keys(socialeVerzoeken).length) verzoeken.innerHTML = '<p class="subtitel">Geen nieuwe verzoeken.</p>';
}

function openChat(uid, naam) {
  huidigChatUid = uid; huidigChatNaam = naam;
  const overlay = document.getElementById('chat-overlay');
  document.getElementById('chat-titel').textContent = 'Chat met ' + naam;
  overlay.classList.add('actief');
  laadChatBerichten();
}

function laadChatBerichten() {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker || !huidigChatUid) return;
  const lijst = document.getElementById('chat-berichten');
  db.ref('chats/' + chatIdVoor(gebruiker.uid, huidigChatUid) + '/berichten').off();
  db.ref('chats/' + chatIdVoor(gebruiker.uid, huidigChatUid) + '/berichten').limitToLast(100).on('value', snap => {
    lijst.innerHTML = '';
    snap.forEach(child => {
      const b = child.val() || {};
      const p = document.createElement('p');
      p.className = b.uid === gebruiker.uid ? 'chat-bericht eigen' : 'chat-bericht';
      p.textContent = (b.gebruikersnaam || 'Gebruiker') + ': ' + (b.tekst || '');
      lijst.appendChild(p);
    });
    lijst.scrollTop = lijst.scrollHeight;
  });
}

function verstuurChatBericht() {
  const gebruiker = profielFirebaseGebruiker();
  const input = document.getElementById('chat-input');
  const tekst = veiligeChatTekst(input.value);
  if (!gebruiker || !huidigChatUid || !tekst) return;
  const ref = db.ref('chats/' + chatIdVoor(gebruiker.uid, huidigChatUid) + '/berichten').push();
  ref.set({ uid: gebruiker.uid, gebruikersnaam: huidigeMakerNaam(), tekst: tekst, tijd: firebase.database.ServerValue.TIMESTAMP });
  input.value = '';
}

function openVriendStuurOverlay(type, item) {
  const lijst = document.getElementById('stuur-vriend-lijst');
  const overlay = document.getElementById('stuur-vriend-overlay');
  if (!lijst || !overlay) return;
  lijst.innerHTML = '';
  Object.entries(socialeVrienden).forEach(([uid, info]) => {
    const knop = document.createElement('button');
    knop.type = 'button'; knop.className = 'btn btn-secondary stuur-vriend-knop';
    knop.textContent = '🎁 ' + (info.gebruikersnaam || 'Vriend');
    knop.addEventListener('click', () => verstuurItemNaarVriend(uid, info.gebruikersnaam || 'Vriend', type, item));
    lijst.appendChild(knop);
  });
  if (!Object.keys(socialeVrienden).length) lijst.innerHTML = '<p class="subtitel">Je moet eerst vrienden hebben.</p>';
  overlay.dataset.type = type; overlay.dataset.item = item; overlay.classList.add('actief');
}

function verstuurItemNaarVriend(toUid, naam, type, item) {
  const gebruiker = profielFirebaseGebruiker();
  if (!gebruiker) return;
  if (!socialeVrienden[toUid]) { alert('Je kunt alleen items naar vrienden sturen.'); return; }
  if (aantalVan(type, item) < 1) { alert('Je hebt dit item niet meer.'); return; }
  const pad = type === 'dier' ? 'dieren/' : 'accessoires/';
  const fromRef = db.ref(SOCIAAL_PROFIEL_PAD + '/' + gebruiker.uid + '/bezit/' + pad + item);
  const toRef = db.ref(SOCIAAL_PROFIEL_PAD + '/' + toUid + '/bezit/' + pad + item);
  fromRef.transaction(v => { const n = Number(v) || 0; return n > 0 ? n - 1 : v; }).then(result => {
    if (!result.committed || Number(result.snapshot.val() || 0) < 0) throw new Error('geen exemplaar');
    return toRef.transaction(v => (Number(v) || 0) + 1);
  }).then(() => {
    verwijderEenUitBezit(type, item);
    sluitStuurVriendOverlay();
    alert('🎁 Verstuurd naar ' + naam + '!');
  }).catch(() => alert('Versturen is mislukt. Probeer opnieuw.'));
}

function sluitStuurVriendOverlay() {
  document.getElementById('stuur-vriend-overlay').classList.remove('actief');
}

// Sociale pagina openen.
document.getElementById('btn-naar-vrienden').addEventListener('click', () => {
  metProfielVereist(() => { toonScherm('scherm-vrienden'); laadVriendenEnVerzoeken(); });
});

document.getElementById('input-zoek-vrienden').addEventListener('input', e => {
  clearTimeout(socialeZoekTimer);
  socialeZoekTimer = setTimeout(() => zoekGebruikersOpNaam(e.target.value), 250);
});
document.getElementById('btn-chat-sluiten').addEventListener('click', () => {
  document.getElementById('chat-overlay').classList.remove('actief');
  huidigChatUid = '';
});
document.getElementById('btn-chat-sturen').addEventListener('click', verstuurChatBericht);
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') verstuurChatBericht(); });
document.getElementById('btn-stuur-vriend-sluiten').addEventListener('click', sluitStuurVriendOverlay);

// Houd het online profiel gelijk aan de lokale profielkeuze.
const _oudeWerkProfielBadgeBij = werkProfielBadgeBij;
werkProfielBadgeBij = function() {
  _oudeWerkProfielBadgeBij();
  if (heeftProfiel()) registreerSociaalProfiel();
};

// Initialiseer aantallen voor bestaande spelers en publiceer het profiel zodra
// anonieme Firebase-auth klaar is.
huidigeBezitAantallen();
if (heeftProfiel()) {
  setTimeout(() => { registreerSociaalProfiel(); laadOnlineBezitVoorEigenProfiel(); }, 0);
}
