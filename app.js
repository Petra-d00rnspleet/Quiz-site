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

document.getElementById('btn-toevoegen-quiz').addEventListener('click', () => {
  document.getElementById('input-titel').value = '';
  document.getElementById('input-vraag').value = '';
  document.getElementById('input-antwoord-1').value = '';
  document.getElementById('input-antwoord-2').value = '';
  document.getElementById('input-antwoord-3').value = '';
  document.getElementById('input-antwoord-4').value = '';
  document.getElementById('quizmaken-foutmelding').textContent = '';
  toonScherm('scherm-nieuwe-quiz');
});

document.querySelectorAll('[data-terug-naar]').forEach(knop => {
  knop.addEventListener('click', () => {
    toonScherm(knop.getAttribute('data-terug-naar'));
  });
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
  const vraag = document.getElementById('input-vraag').value.trim();
  const antwoord1 = document.getElementById('input-antwoord-1').value.trim();
  const antwoord2 = document.getElementById('input-antwoord-2').value.trim();
  const antwoord3 = document.getElementById('input-antwoord-3').value.trim();
  const antwoord4 = document.getElementById('input-antwoord-4').value.trim();
  const goedAntwoord = document.getElementById('select-goed-antwoord').value;

  const foutmelding = document.getElementById('quizmaken-foutmelding');

  if (!titel || !vraag || !antwoord1 || !antwoord2 || !antwoord3 || !antwoord4) {
    foutmelding.textContent = 'Vul alle velden in.';
    return;
  }

  const code = genereerCode();

  const quizData = {
    titel: titel,
    vraag: vraag,
    antwoorden: [antwoord1, antwoord2, antwoord3, antwoord4],
    goedAntwoord: parseInt(goedAntwoord, 10),
    aangemaaktOp: Date.now()
  };

  db.ref('quizzen/' + code).set(quizData)
    .then(() => {
      // Code lokaal onthouden zodat "Mijn quizzen" ze kan tonen
      const eigenCodes = JSON.parse(localStorage.getItem('eigenQuizCodes') || '[]');
      eigenCodes.push(code);
      localStorage.setItem('eigenQuizCodes', JSON.stringify(eigenCodes));

      document.getElementById('code-weergave').textContent = code;
      toonScherm('scherm-quiz-klaar');
    })
    .catch(err => {
      foutmelding.textContent = 'Opslaan mislukt: ' + err.message;
    });
});

// ---------- Eigen quizzen tonen ----------

function laadEigenQuizzen() {
  const lijstEl = document.getElementById('lijst-eigen-quizzen');
  lijstEl.innerHTML = '';

  const eigenCodes = JSON.parse(localStorage.getItem('eigenQuizCodes') || '[]');

  if (eigenCodes.length === 0) {
    lijstEl.innerHTML = '<p>Je hebt nog geen quiz gemaakt.</p>';
    return;
  }

  eigenCodes.forEach(code => {
    db.ref('quizzen/' + code).once('value').then(snapshot => {
      const data = snapshot.val();
      if (!data) return;
      const item = document.createElement('div');
      item.className = 'quiz-item';
      item.innerHTML = `<strong>${data.titel}</strong><span>Code: ${code}</span>`;
      lijstEl.appendChild(item);
    });
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
      toonQuiz(code, data);
    })
    .catch(err => {
      foutmelding.textContent = 'Er ging iets mis: ' + err.message;
    });
});

function toonQuiz(code, data) {
  document.getElementById('quiz-titel-weergave').textContent = data.titel;
  document.getElementById('quiz-vraag-weergave').textContent = data.vraag;

  const antwoordenEl = document.getElementById('quiz-antwoorden-weergave');
  antwoordenEl.innerHTML = '';

  data.antwoorden.forEach((antwoordTekst, index) => {
    const optie = document.createElement('div');
    optie.className = 'antwoord-optie';
    optie.textContent = antwoordTekst;

    optie.addEventListener('click', () => {
      // Voorkom dubbel klikken
      if (antwoordenEl.dataset.beantwoord === 'true') return;
      antwoordenEl.dataset.beantwoord = 'true';

      const gekozenNummer = index + 1;
      if (gekozenNummer === data.goedAntwoord) {
        optie.classList.add('goed');
      } else {
        optie.classList.add('fout');
        // Toon ook welk antwoord wel goed was
        const goedeOptie = antwoordenEl.children[data.goedAntwoord - 1];
        goedeOptie.classList.add('goed');
      }
    });

    antwoordenEl.appendChild(optie);
  });

  toonScherm('scherm-quiz-spelen');
}
