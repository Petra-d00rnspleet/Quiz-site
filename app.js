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

function vernummerVraagBlokken() {
  const blokken = vragenContainer.querySelectorAll('.vraag-blok');
  blokken.forEach((blok, index) => {
    blok.querySelector('.vraag-blok-titel').textContent = 'Vraag ' + (index + 1);
  });
}

function voegVraagBlokToe() {
  const kloon = sjabloonVraagBlok.content.cloneNode(true);
  const blokEl = kloon.querySelector('.vraag-blok');

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
  document.getElementById('input-titel').value = '';
  vragenContainer.innerHTML = '';
  document.getElementById('quizmaken-foutmelding').textContent = '';
  voegVraagBlokToe();
  toonScherm('scherm-nieuwe-quiz');
});

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

      toonScherm('scherm-quizmaken');
      laadEigenQuizzen();
    })
    .catch(err => {
      foutmelding.textContent = 'Opslaan mislukt: ' + err.message;
    });
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

    const speelKnop = document.createElement('button');
    speelKnop.className = 'btn-spelen';
    speelKnop.textContent = 'Spelen';
    speelKnop.addEventListener('click', () => {
      document.getElementById('code-weergave').textContent = quiz.code;
      toonScherm('scherm-quiz-klaar');
    });

    item.appendChild(info);
    item.appendChild(speelKnop);
    lijstEl.appendChild(item);
  });
}

// ---------- Meedoen aan quiz ----------

document.getElementById('btn-ga-naar-quiz').addEventListener('click', () => {
  const code = document.getElementById('input-code').value.trim().toUpperCase();
  const foutmelding = document.getElementById('meedoen-foutmelding');
  foutmelding.textContent = '';

  if (!code) {
    foutmelding.textContent = 'Vul een code in.';
    return;
  }

  db.ref('quizzen/' + code).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        foutmelding.textContent = 'Geen quiz gevonden met deze code.';
        return;
      }
      document.getElementById('input-code').value = '';
      startQuiz(data);
    })
    .catch(err => {
      foutmelding.textContent = 'Er ging iets mis: ' + err.message;
    });
});

// ---------- Quiz spelen (meerdere vragen na elkaar) ----------

let huidigeQuizData = null;
let huidigeVraagIndex = 0;

function startQuiz(data) {
  huidigeQuizData = data;
  huidigeVraagIndex = 0;
  document.getElementById('quiz-titel-weergave').textContent = data.titel;
  toonScherm('scherm-quiz-spelen');
  toonVraag();
}

function toonVraag() {
  const vraag = huidigeQuizData.vragen[huidigeVraagIndex];
  const totaalVragen = huidigeQuizData.vragen.length;

  document.getElementById('quiz-voortgang-weergave').textContent =
    'Vraag ' + (huidigeVraagIndex + 1) + ' van ' + totaalVragen;
  document.getElementById('quiz-vraag-weergave').textContent = vraag.vraag;

  const antwoordenEl = document.getElementById('quiz-antwoorden-weergave');
  antwoordenEl.innerHTML = '';
  antwoordenEl.dataset.beantwoord = 'false';

  const volgendeKnop = document.getElementById('btn-volgende-vraag');
  volgendeKnop.style.display = 'none';
  volgendeKnop.textContent = (huidigeVraagIndex + 1 < totaalVragen) ? 'Volgende vraag' : 'Klaar';

  vraag.antwoorden.forEach((antwoordTekst, index) => {
    const optie = document.createElement('div');
    optie.className = 'antwoord-optie';
    optie.textContent = antwoordTekst;

    optie.addEventListener('click', () => {
      if (antwoordenEl.dataset.beantwoord === 'true') return;
      antwoordenEl.dataset.beantwoord = 'true';

      const gekozenNummer = index + 1;
      if (gekozenNummer === vraag.goedAntwoord) {
        optie.classList.add('goed');
      } else {
        optie.classList.add('fout');
        const goedeOptie = antwoordenEl.children[vraag.goedAntwoord - 1];
        goedeOptie.classList.add('goed');
      }

      volgendeKnop.style.display = 'block';
    });

    antwoordenEl.appendChild(optie);
  });
}

document.getElementById('btn-volgende-vraag').addEventListener('click', () => {
  const totaalVragen = huidigeQuizData.vragen.length;
  if (huidigeVraagIndex + 1 < totaalVragen) {
    huidigeVraagIndex++;
    toonVraag();
  } else {
    // Klaar met de quiz
    toonScherm('scherm-algemeen');
  }
});
