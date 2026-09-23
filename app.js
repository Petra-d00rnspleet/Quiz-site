// ---------- Sitebeheer (echt inloggen via Firebase Authentication) ----------
//
// De beheerder logt in met een e-mailadres + wachtwoord dat in de Firebase
// Console staat (Authentication -> Users), niet in deze broncode. Zie de
// readme voor hoe je dat account daar aanmaakt. Firebase onthoudt het
// ingelogd zijn automatisch, dus na een herlaadbeurt blijft de beheerder
// ingelogd tot er bewust wordt uitgelogd.

let sitebeheerActief = false;

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
  sitebeheerActief = !!gebruiker;
  werkSitebeheerKnopBij();
  if (document.getElementById('scherm-speelbare-quizzen').classList.contains('actief')) {
    laadOpenbareQuizzen();
  }
  if (document.getElementById('scherm-quizmaken').classList.contains('actief')) {
    laadEigenQuizzen();
  }
});

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

function huidigeMakerNaam() {
  return localStorage.getItem(MAKER_NAAM_SLEUTEL);
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
  localStorage.setItem(MAKER_NAAM_SLEUTEL, naam);
  toonScherm('scherm-quizmaken');
  // Eerst de naam bij bestaande quizzen zetten, dan pas het overzicht laden.
  koppelMakerNaamAanEigenQuizzen().then(() => laadEigenQuizzen());
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
  if (huidigeMakerNaam()) {
    toonScherm('scherm-quizmaken');
    laadEigenQuizzen();
  } else {
    inputMakerNaamEl.value = '';
    naamInvullenFoutmeldingEl.textContent = '';
    toonScherm('scherm-naam-invullen');
  }
});

document.getElementById('btn-naar-speelbaar').addEventListener('click', () => {
  toonScherm('scherm-speelbare-quizzen');
  laadOpenbareQuizzen();
});

document.getElementById('btn-naar-meedoen').addEventListener('click', () => {
  toonScherm('scherm-meedoen');
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
    blokEl.querySelector('.veld-punten').value = String(genormaliseerd.punten);

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
    const puntenIngevoerd = parseInt(blok.querySelector('.veld-punten').value, 10);
    const punten = (Number.isFinite(puntenIngevoerd) && puntenIngevoerd >= 0) ? puntenIngevoerd : 1000;

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

// ---------- Poppetje: een dier + accessoires (hoeden, brillen, hartjes, ...) ----------
// De tekeningen zelf (dieren, hoeden, brillen, ...) staan in poppetjes.js. Dat bestand
// levert DIEREN, ACCESSOIRE_GROEPEN, geldigeAccessoires() en poppetjeSvg().

let kiezerTab = 'dieren'; // 'dieren' of 'accessoires' (welk tabblad open staat in de wachtkamer)
let huidigePoppetje = { dier: '', accessoires: {} }; // wat deze speler nu heeft gekozen

function willekeurigDier() {
  return DIEREN[Math.floor(Math.random() * DIEREN.length)];
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

  if (opDieren) {
    DIEREN.forEach(dier => {
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
    const voorbeeldDier = huidigePoppetje.dier || DIEREN[0];
    ACCESSOIRE_GROEPEN.forEach(groep => {
      const kop = document.createElement('div');
      kop.className = 'kiezer-groep-titel';
      kop.textContent = groep.titel;
      kiezerEl.appendChild(kop);

      groep.items.forEach(emoji => {
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
  if (!magPoppetjeWijzigen() || !geldigDier(dier)) return;

  toonGekozenPoppetje({ dier: dier, accessoires: huidigePoppetje.accessoires });
  spelerRef().child('dier').set(dier);
}

// De speler kiest een accessoire. Nog eens op hetzelfde tikken haalt het weer weg.
function kiesAccessoire(plek, emoji) {
  if (!magPoppetjeWijzigen()) return;
  const groep = ACCESSOIRE_GROEPEN.find(g => g.plek === plek);
  if (!groep || groep.items.indexOf(emoji) === -1) return;

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
    score.textContent = (speler.score || 0) + ' pt';

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
    document.getElementById('speler-scorebord-bericht').textContent =
      sessie.status === 'afgelopen' ? 'Bedankt voor het meespelen!' : '';

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
  document.getElementById('solo-einde-tekst').textContent =
    'Je had ' + soloAantalGoed + ' van de ' + totaal + (totaal === 1 ? ' vraag' : ' vragen') + ' goed';

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

bouwKiezer();

// ---------- Bij het openen van de site: naam bij eigen quizzen zetten ----------
koppelMakerNaamAanEigenQuizzen();
