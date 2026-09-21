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
});

// ---------- Naam van de quizmaker (verplicht, eenmalig, niet meer te wijzigen) ----------
//
// Voordat iemand een quiz kan maken, moet die zijn/haar naam invullen. Deze
// naam wordt lokaal onthouden (localStorage) en bij elke quiz die diegene
// maakt als "makerNaam" opgeslagen in Firebase. Zodra een quiz openbaar
// staat, is die naam voor iedereen zichtbaar bij "Speelbare quizzen".
// Er is bewust geen manier om de naam later te wijzigen.

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
  return {
    vraag: vraag.vraag,
    antwoorden: vraag.antwoorden || [],
    goedAntwoorden: goedAntwoorden,
    afbeelding: vraag.afbeelding || ''
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

document.getElementById('btn-toevoegen-quiz').addEventListener('click', () => {
  huidigeBewerkCode = null;
  huidigeBewerkTerugScherm = 'scherm-quizmaken';
  document.getElementById('input-titel').value = '';
  vragenContainer.innerHTML = '';
  document.getElementById('quizmaken-foutmelding').textContent = '';
  document.getElementById('nieuwe-quiz-titel-kop').textContent = 'Nieuwe quiz';
  document.getElementById('btn-quiz-opslaan').textContent = 'Quiz opslaan';
  document.getElementById('input-openbaar').checked = false;
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
    document.getElementById('input-titel').value = quizData.titel;
    vragenContainer.innerHTML = '';
    document.getElementById('quizmaken-foutmelding').textContent = '';
    document.getElementById('input-openbaar').checked = !!quizData.openbaar;
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
      goedAntwoorden: goedAntwoorden
    };
    if (blok._afbeelding) {
      vraagData.afbeelding = blok._afbeelding;
    }
    vragen.push(vraagData);
  }

  const isOpenbaar = document.getElementById('input-openbaar').checked;

  if (huidigeBewerkCode) {
    // Bestaande quiz bijwerken: zelfde code, alleen titel + vragen + omslag + openbaar overschrijven.
    const code = huidigeBewerkCode;
    const terugScherm = huidigeBewerkTerugScherm;

    const updateData = { titel: titel, vragen: vragen, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar, doorBeheerVerwijderd: false };

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
      const makerNaam = (liveData && liveData.makerNaam) || '';

      const item = document.createElement('div');
      item.className = 'quiz-item';

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
      info.innerHTML = `<strong>${escapeHtml(quiz.titel)}</strong><span>${quiz.aantalVragen} vraag/vragen${makerNaam ? ' · Door ' + escapeHtml(makerNaam) : ''}${actueelOpenbaar ? ' · Openbaar' : ''}</span>`;

      const knoppen = document.createElement('div');
      knoppen.className = 'quiz-item-knoppen';

      const speelKnop = document.createElement('button');
      speelKnop.className = 'btn-spelen';
      speelKnop.textContent = 'Spelen';
      speelKnop.addEventListener('click', () => {
        startHostenVanQuiz(quiz.code);
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
          weggehaald: !!(quiz && quiz.doorBeheerVerwijderd)
        });
      });

      const makers = Object.values(groepen).sort((a, b) => {
        if (!a.naam) return 1;   // "naam onbekend" altijd onderaan
        if (!b.naam) return -1;
        return a.naam.localeCompare(b.naam, 'nl');
      });

      if (makers.length === 0) {
        overzichtEl.innerHTML = '<h3>Alle quizmakers</h3><p class="voortgang">Er zijn nog geen quizzen gemaakt.</p>';
        return;
      }

      const rijen = makers.map(maker => {
        const aantalOpenbaar = maker.quizzen.filter(q => q.openbaar).length;
        const titels = maker.quizzen.map(q => {
          const status = q.openbaar ? 'openbaar' : (q.weggehaald ? 'weggehaald' : 'niet openbaar');
          return '<li>' + escapeHtml(q.titel) + ' <span class="sitebeheer-maker-code">' + escapeHtml(q.code) + ' · ' + status + '</span></li>';
        }).join('');
        return '<div class="sitebeheer-maker-rij">' +
          '<strong>' + (maker.naam ? escapeHtml(maker.naam) : 'Naam onbekend') + '</strong>' +
          '<span class="sitebeheer-maker-telling">' + maker.quizzen.length + ' quiz/quizzen · ' + aantalOpenbaar + ' openbaar</span>' +
          '<ul>' + titels + '</ul>' +
          '</div>';
      }).join('');

      overzichtEl.innerHTML = '<h3>Alle quizmakers (' + makers.length + ')</h3>' + rijen;
    })
    .catch(err => {
      overzichtEl.innerHTML = '<p class="foutmelding">Laden van quizmakers mislukt: ' + escapeHtml(err.message) + '</p>';
    });
}

function laadOpenbareQuizzen() {
  const lijstEl = document.getElementById('lijst-openbare-quizzen');
  lijstEl.innerHTML = '<p>Bezig met laden...</p>';
  toonSitebeheerMakersOverzicht();

  koppelMakerNaamAanEigenQuizzen()
    .then(() => db.ref('quizzen').orderByChild('openbaar').equalTo(true).once('value'))
    .then(snapshot => {
      lijstEl.innerHTML = '';
      const data = snapshot.val();

      if (!data) {
        lijstEl.innerHTML = '<p>Er zijn nog geen openbare quizzen. Zet je eigen quiz op openbaar om hem hier te laten verschijnen.</p>';
        return;
      }

      Object.entries(data).forEach(([code, quiz]) => {
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
        const doorTekst = makerNaam
          ? ' · Door ' + escapeHtml(makerNaam)
          : (sitebeheerActief ? ' · Door: naam onbekend' : '');
        const codeTekst = sitebeheerActief ? ' · Code ' + escapeHtml(code) : '';
        info.innerHTML = `<strong>${escapeHtml(quiz.titel)}</strong><span>${aantalVragen} vraag/vragen${doorTekst}${codeTekst}</span>`;

        const knoppen = document.createElement('div');
        knoppen.className = 'quiz-item-knoppen';

        const speelKnop = document.createElement('button');
        speelKnop.className = 'btn-spelen';
        speelKnop.textContent = 'Spelen';
        speelKnop.addEventListener('click', () => {
          startHostenVanQuiz(code);
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
        lijstEl.appendChild(item);
      });
    })
    .catch(err => {
      lijstEl.innerHTML = '<p>Laden van openbare quizzen mislukt: ' + err.message + '</p>';
    });
}

// ================================================================
//  LIVE QUIZ: hosten, meedoen, spelen en scorebord
// ================================================================
//
// Structuur in Firebase:
//   quizzen/<code>            -> titel, vragen, aangemaaktOp  (al bestond)
//   sessies/<code>            -> status, huidigeVraagIndex, spelers, antwoorden
//     status: 'wachtkamer' | 'vraag' | 'resultaat' | 'antwoord' | 'scorebord' | 'afgelopen'
//       vraag     -> spelers antwoorden (daarna zien ze alleen een groot laadteken)
//       resultaat -> spelers zien alleen of ze het goed hadden (punten worden nu geteld)
//       antwoord  -> iedereen ziet het goede antwoord in het groot
//       scorebord -> alleen het scorebord, zonder vraag en antwoord
//     spelers/<spelerId>      -> naam, score, totaleReactietijd
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
let huidigeVraagIndexHost = -1;
let huidigeSpelerId = null;

let laatstGetoondeVraagIndexSpeler = -1;
let vraagGetoondOpSpeler = 0;
let spelerHeeftGeantwoord = false;
let spelerGeselecteerdeAntwoorden = [];
let huidigeStatusSpeler = '';

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
    vraag.goedAntwoorden.length > 1 ? 'De goede antwoorden:' : 'Het goede antwoord:';

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

    rij.appendChild(plek);
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

function renderSessieVoorHost(sessie) {
  huidigeVraagIndexHost = sessie.huidigeVraagIndex;
  const spelers = sessie.spelers || {};
  const aantalSpelers = Object.keys(spelers).length;

  if (sessie.status === 'wachtkamer') {
    document.getElementById('host-wachtkamer-aantal').textContent = aantalSpelers + ' speler(s) aanwezig';

    const lijstEl = document.getElementById('host-wachtkamer-spelerslijst');
    lijstEl.innerHTML = '';
    Object.entries(spelers).forEach(([spelerId, speler]) => {
      const chip = document.createElement('div');
      chip.className = 'speler-chip';
      chip.title = 'Klik om ' + speler.naam + ' te verwijderen';
      chip.innerHTML = '<span class="speler-chip-naam">' + speler.naam + '</span><span class="speler-chip-kruis">&times;</span>';
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
      'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length;
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
  }

  if (sessie.status === 'resultaat') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    const antwoordenVoorVraag = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const aantalGoed = Object.values(antwoordenVoorVraag)
      .filter(a => setsGelijk(a.antwoordIndexen || [], vraag.goedAntwoorden)).length;

    document.getElementById('host-resultaat-voortgang').textContent =
      'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length;
    document.getElementById('host-resultaat-vraag').textContent = vraag.vraag;
    document.getElementById('host-resultaat-telling').textContent =
      aantalGoed + ' van ' + aantalSpelers + ' spelers hadden het goed';

    toonScherm('scherm-host-resultaat');
  }

  if (sessie.status === 'antwoord') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    renderGroteAntwoorden('host', vraag);
    toonScherm('scherm-host-antwoord');
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
function berekenScoresEnToonResultaat() {
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
        updates['spelers/' + spelerId + '/score'] = huidigeScore + 1000;
        updates['spelers/' + spelerId + '/totaleReactietijd'] = huidigeTijd + (antwoord.reactietijdMs || 0);
      }
    });
    updates['status'] = 'resultaat';

    return sessieRef.update(updates);
  });
}

document.getElementById('btn-host-toon-resultaat').addEventListener('click', (e) => {
  e.target.disabled = true;
  berekenScoresEnToonResultaat().finally(() => {
    e.target.disabled = false;
  });
});

// Stap 2: het goede antwoord in het groot tonen (bij host en spelers).
document.getElementById('btn-host-toon-antwoord').addEventListener('click', () => {
  db.ref('sessies/' + huidigeSessieCode).update({ status: 'antwoord' });
});

// Stap 3: het scorebord (zonder vraag en antwoord).
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
  toonScherm('scherm-quizmaken');
  laadEigenQuizzen();
});

document.getElementById('btn-host-verlaat-wachtkamer').addEventListener('click', () => {
  if (huidigeSessieCode) {
    db.ref('sessies/' + huidigeSessieCode).remove();
  }
  stopSessieListener();
  huidigeRol = null;
  toonScherm('scherm-quizmaken');
  laadEigenQuizzen();
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

        return db.ref('sessies/' + code + '/spelers/' + huidigeSpelerId)
          .set({ naam: naam, score: 0, totaleReactietijd: 0 })
          .then(() => {
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
        'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length;
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

    toonScherm('scherm-speler-resultaat');
  }

  if (sessie.status === 'antwoord') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    renderGroteAntwoorden('speler', vraag);
    toonScherm('scherm-speler-antwoord');
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

// ---------- Bij het openen van de site: naam bij eigen quizzen zetten ----------
koppelMakerNaamAanEigenQuizzen();
