// ---------- Sitebeheer (wachtwoord-beveiligd: quizzen uit "Speelbare quizzen" verwijderen) ----------
//
// Let op: dit is alleen een simpele drempel, geen echte beveiliging. Omdat dit
// wachtwoord in de JS-broncode staat, kan iedereen die de site bekijkt het
// wachtwoord in principe terugvinden (bijv. via de ontwikkelaarstools van de
// browser). Gebruik dus geen wachtwoord dat je ergens anders ook gebruikt,
// en zie dit als een drempel tegen toevallige bezoekers, niet als een slot.
const SITEBEHEER_WACHTWOORD = 'Pleun&Sara!YEAH!123'; // Pas dit gerust aan naar jouw eigen wachtwoord.

let sitebeheerActief = false;

const sitebeheerOverlayEl = document.getElementById('sitebeheer-overlay');
const inputSitebeheerWachtwoordEl = document.getElementById('input-sitebeheer-wachtwoord');
const sitebeheerFoutmeldingEl = document.getElementById('sitebeheer-foutmelding');
const btnSitebeheerEl = document.getElementById('btn-sitebeheer');

function openSitebeheerOverlay() {
  sitebeheerFoutmeldingEl.textContent = '';
  inputSitebeheerWachtwoordEl.value = '';
  sitebeheerOverlayEl.classList.add('actief');
  inputSitebeheerWachtwoordEl.focus();
}

function sluitSitebeheerOverlay() {
  sitebeheerOverlayEl.classList.remove('actief');
}

btnSitebeheerEl.addEventListener('click', () => {
  if (sitebeheerActief) {
    // Al ingelogd: nogmaals klikken logt meteen uit, geen wachtwoord nodig.
    sitebeheerActief = false;
    btnSitebeheerEl.classList.remove('actief');
    btnSitebeheerEl.textContent = '⚙ Sitebeheer';
    if (document.getElementById('scherm-speelbare-quizzen').classList.contains('actief')) {
      laadOpenbareQuizzen();
    }
    return;
  }
  openSitebeheerOverlay();
});

document.getElementById('btn-sitebeheer-annuleren').addEventListener('click', () => {
  sluitSitebeheerOverlay();
});

function probeerSitebeheerInloggen() {
  if (inputSitebeheerWachtwoordEl.value === SITEBEHEER_WACHTWOORD) {
    sitebeheerActief = true;
    btnSitebeheerEl.classList.add('actief');
    btnSitebeheerEl.textContent = '🔓 Sitebeheer actief';
    sluitSitebeheerOverlay();
    if (document.getElementById('scherm-speelbare-quizzen').classList.contains('actief')) {
      laadOpenbareQuizzen();
    }
  } else {
    sitebeheerFoutmeldingEl.textContent = 'Onjuist wachtwoord.';
  }
}

document.getElementById('btn-sitebeheer-bevestigen').addEventListener('click', probeerSitebeheerInloggen);

inputSitebeheerWachtwoordEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    probeerSitebeheerInloggen();
  }
});

// ---------- Navigatie tussen schermen ----------

function toonScherm(id) {
  document.querySelectorAll('.scherm').forEach(el => el.classList.remove('actief'));
  document.getElementById(id).classList.add('actief');
}

document.getElementById('btn-naar-quizmaken').addEventListener('click', () => {
  toonScherm('scherm-quizmaken');
  laadEigenQuizzen();
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
    blokEl.querySelector('.veld-vraag').value = vraagData.vraag;
    const antwoordVelden = blokEl.querySelectorAll('.veld-antwoord');
    antwoordVelden.forEach((veld, i) => {
      veld.value = vraagData.antwoorden[i] || '';
    });
    blokEl.querySelector('.veld-goed').value = vraagData.goedAntwoord;
  }

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

function startBewerkenVanQuiz(code) {
  db.ref('quizzen/' + code).once('value').then(snapshot => {
    const quizData = snapshot.val();
    if (!quizData) {
      alert('Deze quiz kon niet gevonden worden (misschien is hij verwijderd).');
      return;
    }

    huidigeBewerkCode = code;
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
    const antwoordVelden = blok.querySelectorAll('.veld-antwoord');
    const antwoorden = Array.from(antwoordVelden).map(veld => veld.value.trim());
    const goedAntwoord = parseInt(blok.querySelector('.veld-goed').value, 10);

    if (!vraagTekst || antwoorden.some(a => !a)) {
      foutmelding.textContent = 'Vul bij elke vraag de vraagtekst en alle 4 antwoorden in.';
      return;
    }

    vragen.push({
      vraag: vraagTekst,
      antwoorden: antwoorden,
      goedAntwoord: goedAntwoord
    });
  }

  const isOpenbaar = document.getElementById('input-openbaar').checked;

  if (huidigeBewerkCode) {
    // Bestaande quiz bijwerken: zelfde code, alleen titel + vragen + omslag + openbaar overschrijven.
    const code = huidigeBewerkCode;

    db.ref('quizzen/' + code).update({ titel: titel, vragen: vragen, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar, doorBeheerVerwijderd: false })
      .then(() => {
        const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
        const bijgewerkteLijst = eigenQuizzen.map(q =>
          q.code === code ? { code: code, titel: titel, aantalVragen: vragen.length, afbeelding: geselecteerdeOmslagUrl, openbaar: isOpenbaar } : q
        );
        localStorage.setItem('eigenQuizzen', JSON.stringify(bijgewerkteLijst));

        huidigeBewerkCode = null;
        toonScherm('scherm-quizmaken');
        laadEigenQuizzen();
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
  Promise.all(
    eigenQuizzen.map(quiz =>
      db.ref('quizzen/' + quiz.code).once('value').then(snapshot => ({
        quiz: quiz,
        liveData: snapshot.val()
      }))
    )
  ).then(resultaten => {
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
      info.innerHTML = `<strong>${quiz.titel}</strong><span>${quiz.aantalVragen} vraag/vragen${actueelOpenbaar ? ' · Openbaar' : ''}</span>`;

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

function laadOpenbareQuizzen() {
  const lijstEl = document.getElementById('lijst-openbare-quizzen');
  lijstEl.innerHTML = '<p>Bezig met laden...</p>';

  db.ref('quizzen').orderByChild('openbaar').equalTo(true).once('value')
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
        info.innerHTML = `<strong>${quiz.titel}</strong><span>${aantalVragen} vraag/vragen</span>`;

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
//     status: 'wachtkamer' | 'vraag' | 'scorebord' | 'afgelopen'
//     spelers/<spelerId>      -> naam, score, totaleReactietijd
//     antwoorden/<vraagIndex>/<spelerId> -> antwoordIndex, reactietijdMs
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

    huidigeQuizVragen = quizData.vragen;
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

  if (sessie.status === 'scorebord' || sessie.status === 'afgelopen') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];

    document.getElementById('host-scorebord-titel').textContent =
      sessie.status === 'afgelopen' ? 'Eindstand 🏆' : 'Scorebord';

    const hostScorebordAntwoordenEl = document.getElementById('host-scorebord-antwoorden');
    hostScorebordAntwoordenEl.innerHTML = '';

    if (sessie.status === 'afgelopen') {
      document.getElementById('host-scorebord-goede-antwoord').textContent = '';
    } else {
      document.getElementById('host-scorebord-goede-antwoord').textContent = 'Het goede antwoord:';
      vraag.antwoorden.forEach((tekst, index) => {
        const optie = document.createElement('div');
        optie.className = 'antwoord-optie' + (index + 1 === vraag.goedAntwoord ? ' goed' : '');
        optie.textContent = tekst;
        hostScorebordAntwoordenEl.appendChild(optie);
      });
    }

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

function berekenEnToonScorebord() {
  const sessieRef = db.ref('sessies/' + huidigeSessieCode);
  return sessieRef.once('value').then(snapshot => {
    const sessie = snapshot.val();
    const vraagIndex = sessie.huidigeVraagIndex;
    const vraag = huidigeQuizVragen[vraagIndex];
    const antwoordenVoorVraag = (sessie.antwoorden && sessie.antwoorden[vraagIndex]) || {};
    const spelers = sessie.spelers || {};

    const updates = {};
    Object.keys(antwoordenVoorVraag).forEach(spelerId => {
      const antwoord = antwoordenVoorVraag[spelerId];
      if (antwoord.antwoordIndex === vraag.goedAntwoord) {
        const huidigeScore = (spelers[spelerId] && spelers[spelerId].score) || 0;
        const huidigeTijd = (spelers[spelerId] && spelers[spelerId].totaleReactietijd) || 0;
        updates['spelers/' + spelerId + '/score'] = huidigeScore + 1000;
        updates['spelers/' + spelerId + '/totaleReactietijd'] = huidigeTijd + (antwoord.reactietijdMs || 0);
      }
    });
    updates['status'] = 'scorebord';

    return sessieRef.update(updates);
  });
}

document.getElementById('btn-host-toon-scorebord').addEventListener('click', (e) => {
  e.target.disabled = true;
  berekenEnToonScorebord().finally(() => {
    e.target.disabled = false;
  });
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

        huidigeQuizVragen = quizData.vragen;
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
    }

    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];
    const eigenAntwoorden = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
    const eigenAntwoord = eigenAntwoorden[huidigeSpelerId];

    if (eigenAntwoord) {
      // Al geantwoord op deze vraag: apart tussenscherm, niet de vraag zelf.
      const goedGeantwoord = eigenAntwoord.antwoordIndex === vraag.goedAntwoord;
      document.getElementById('speler-antwoord-verzonden-titel').textContent =
        goedGeantwoord ? 'Goed! ✔' : 'Helaas ✗';
      document.getElementById('speler-antwoord-verzonden-tekst').textContent =
        goedGeantwoord
          ? 'Dat was het juiste antwoord.'
          : 'Dat was niet het juiste antwoord. Het juiste antwoord was: ' + vraag.antwoorden[vraag.goedAntwoord - 1];

      toonScherm('scherm-speler-antwoord-verzonden');
    } else {
      document.getElementById('speler-voortgang-weergave').textContent =
        'Vraag ' + (sessie.huidigeVraagIndex + 1) + ' van ' + huidigeQuizVragen.length;
      document.getElementById('speler-vraag-weergave').textContent = vraag.vraag;

      const antwoordenEl = document.getElementById('speler-antwoorden-weergave');
      antwoordenEl.innerHTML = '';
      vraag.antwoorden.forEach((tekst, index) => {
        const optie = document.createElement('div');
        optie.className = 'antwoord-optie';
        optie.textContent = tekst;

        optie.addEventListener('click', () => {
          if (spelerHeeftGeantwoord) return;
          spelerHeeftGeantwoord = true;

          const reactietijdMs = Date.now() - vraagGetoondOpSpeler;
          db.ref('sessies/' + huidigeSessieCode + '/antwoorden/' + sessie.huidigeVraagIndex + '/' + huidigeSpelerId)
            .set({ antwoordIndex: index + 1, reactietijdMs: reactietijdMs });
        });

        antwoordenEl.appendChild(optie);
      });

      toonScherm('scherm-speler-vraag');
    }
  }

  if (sessie.status === 'scorebord' || sessie.status === 'afgelopen') {
    const vraag = huidigeQuizVragen[sessie.huidigeVraagIndex];

    document.getElementById('speler-scorebord-titel').textContent =
      sessie.status === 'afgelopen' ? 'Eindstand 🏆' : 'Scorebord';
    document.getElementById('speler-scorebord-goede-antwoord').textContent =
      sessie.status === 'afgelopen' ? 'Bedankt voor het meespelen!' : 'Het goede antwoord:';

    const spelerScorebordAntwoordenEl = document.getElementById('speler-scorebord-antwoorden');
    spelerScorebordAntwoordenEl.innerHTML = '';

    if (sessie.status === 'scorebord') {
      const eigenAntwoordenVraag = (sessie.antwoorden && sessie.antwoorden[sessie.huidigeVraagIndex]) || {};
      const eigenAntwoordDitVraag = eigenAntwoordenVraag[huidigeSpelerId];
      const eigenGekozenIndex = eigenAntwoordDitVraag ? eigenAntwoordDitVraag.antwoordIndex : null;

      vraag.antwoorden.forEach((tekst, index) => {
        const optie = document.createElement('div');
        let klasse = 'antwoord-optie';
        if (index + 1 === vraag.goedAntwoord) {
          klasse += ' goed';
        } else if (index + 1 === eigenGekozenIndex) {
          klasse += ' fout';
        }
        optie.className = klasse;
        optie.textContent = tekst;
        spelerScorebordAntwoordenEl.appendChild(optie);
      });
    }

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
