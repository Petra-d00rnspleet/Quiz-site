// ---------- Navigatie tussen schermen ----------

function toonScherm(id) {
  document.querySelectorAll('.scherm').forEach(el => el.classList.remove('actief'));
  document.getElementById(id).classList.add('actief');
}

document.getElementById('btn-naar-quizmaken').addEventListener('click', () => {
  toonScherm('scherm-quizmaken');
  laadEigenQuizzen();
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

// ---------- Vraagblokken opbouwen (nieuwe quiz) ----------

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

  if (huidigeBewerkCode) {
    // Bestaande quiz bijwerken: zelfde code, alleen titel + vragen overschrijven.
    const code = huidigeBewerkCode;

    db.ref('quizzen/' + code).update({ titel: titel, vragen: vragen })
      .then(() => {
        const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
        const bijgewerkteLijst = eigenQuizzen.map(q =>
          q.code === code ? { code: code, titel: titel, aantalVragen: vragen.length } : q
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
    aangemaaktOp: Date.now()
  };

  db.ref('quizzen/' + code).set(quizData)
    .then(() => {
      // Titel + code lokaal onthouden zodat "Mijn quizzen" ze kan tonen
      const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');
      eigenQuizzen.push({ code: code, titel: titel, aantalVragen: vragen.length });
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
  lijstEl.innerHTML = '';

  const eigenQuizzen = JSON.parse(localStorage.getItem('eigenQuizzen') || '[]');

  if (eigenQuizzen.length === 0) {
    lijstEl.innerHTML = '<p>Je hebt nog geen quiz gemaakt.</p>';
    return;
  }

  eigenQuizzen.forEach(quiz => {
    const item = document.createElement('div');
    item.className = 'quiz-item';

    const info = document.createElement('div');
    info.className = 'quiz-item-info';
    info.innerHTML = `<strong>${quiz.titel}</strong><span>${quiz.aantalVragen} vraag/vragen</span>`;

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

    item.appendChild(info);
    item.appendChild(knoppen);
    lijstEl.appendChild(item);
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
    if (!sessie) return;
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

    db.ref('sessies/' + code).set(nieuweSessie).then(() => {
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
    document.getElementById('host-scorebord-goede-antwoord').textContent =
      sessie.status === 'afgelopen' ? '' : 'Het goede antwoord was: ' + vraag.antwoorden[vraag.goedAntwoord - 1];

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
        goedGeantwoord ? 'Goed! ✅' : 'Helaas ❌';
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
      sessie.status === 'afgelopen' ? 'Bedankt voor het meespelen!' : 'Het goede antwoord was: ' + vraag.antwoorden[vraag.goedAntwoord - 1];

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
