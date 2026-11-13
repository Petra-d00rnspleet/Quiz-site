# Quiz App — basisversie

## Bestanden
- `index.html` — de drie/vijf schermen (algemeen, quiz maken, nieuwe quiz, meedoen, quiz spelen)
- `style.css` — styling
- `app.js` — alle logica (navigatie, opslaan in Firebase, ophalen via code)
- `firebase-config.js` — hier vul je jouw eigen Firebase-gegevens in

## Stap 1: Firebase instellen
1. Ga naar https://console.firebase.google.com en maak een nieuw project.
2. Ga naar **Build → Realtime Database** en maak een database aan (kies een regio, bijv. Europe).
3. Zet de database (tijdelijk, voor testen) in testmodus, of gebruik deze regels:
   ```json
   {
     "rules": {
       "quizzen": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   Let op: dit is open voor iedereen. Voor een echt project wil je later regels toevoegen die misbruik voorkomen.
4. Ga naar **Project instellingen → Algemeen → Jouw apps → Web app (</> icoon)** en registreer een app.
5. Kopieer de `firebaseConfig` gegevens naar `firebase-config.js` in dit project.

## Stap 2: Lokaal testen
Open `index.html` gewoon in je browser (of gebruik een simpele lokale server, bijv. de "Live Server" extensie in VS Code).

## Stap 3: Op GitHub zetten
1. Maak een nieuwe repository op GitHub.
2. Zet deze 4 bestanden erin (`index.html`, `style.css`, `app.js`, `firebase-config.js`).
3. Ga naar **Settings → Pages** in je repository, kies de `main` branch en map `/root`.
4. Na een minuut is je site live op `https://jouwgebruikersnaam.github.io/repositorynaam/`.

## Hoe het nu werkt
- **Quiz maken:** je vult een titel in en per vraag: de vraagtekst, 4 antwoorden en welk antwoord goed is. Met "+ Vraag toevoegen" voeg je extra vragen toe aan dezelfde quiz. Na opslaan wordt een unieke 6-tekens code gegenereerd en de hele quiz (titel + alle vragen) wordt opgeslagen onder `quizzen/<code>` in de Realtime Database.
- **Mijn quizzen:** na het opslaan kom je terug op het overzicht en staat je quiz daar in de lijst, met een "Spelen"-knop. Klik daarop om de code te zien die je met spelers kunt delen.
- **Meedoen aan quiz:** iemand voert de code in, de app haalt de quiz op uit Firebase en speelt de vragen één voor één af: kiezen, direct zien of het goed/fout is, dan "Volgende vraag" tot de quiz klaar is.
- De lijst met eigen quizzen (titel + code) wordt lokaal in je browser onthouden (localStorage), zodat je ze terugvindt zolang je dezelfde browser gebruikt.

## Mogelijke volgende stappen
- Score bijhouden per speler.
- Live meespelen (iedereen ziet dezelfde vraag tegelijk) via Firebase realtime listeners.
- Quiz verwijderen/bewerken.
- Firebase-regels aanscherpen zodat mensen niet zomaar andermans quiz kunnen overschrijven.
