# Quiz App — met live hosten en scorebord

## Bestanden
- `index.html` — alle schermen (algemeen, quiz maken, nieuwe quiz, meedoen, wachtkamers, live vraag, scorebord)
- `style.css` — styling
- `app.js` — alle logica (navigatie, opslaan in Firebase, hosten, meedoen, scorebord)
- `firebase-config.js` — hier vul je jouw eigen Firebase-gegevens in (ongewijzigd)

## Stap 1: Firebase instellen
1. Ga naar https://console.firebase.google.com en maak een nieuw project.
2. Ga naar **Build → Realtime Database** en maak een database aan (kies een regio, bijv. Europe).
3. Zet de database (tijdelijk, voor testen) in testmodus, of gebruik deze regels — let op: er is nu ook een `sessies`-pad nodig naast `quizzen`:
   ```json
   {
     "rules": {
       "quizzen": {
         ".read": true,
         ".write": true
       },
       "sessies": {
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
Open `index.html` gewoon in je browser (of gebruik een simpele lokale server, bijv. de "Live Server" extensie in VS Code). Open de host-kant en een speler-kant in twee verschillende tabbladen/apparaten om te testen.

## Stap 3: Op GitHub zetten
1. Maak een nieuwe repository op GitHub.
2. Zet deze bestanden erin (`index.html`, `style.css`, `app.js`, `firebase-config.js`).
3. Ga naar **Settings → Pages** in je repository, kies de `main` branch en map `/root`.
4. Na een minuut is je site live op `https://jouwgebruikersnaam.github.io/repositorynaam/`.

## Hoe het nu werkt

### Quiz maken en verwijderen
- **Quiz maken:** titel + per vraag de vraagtekst, 4 antwoorden en welk antwoord goed is. Na opslaan krijg je een unieke 6-tekens code en zie je meteen een knop **"Nu hosten"**.
- **Mijn quizzen:** elke quiz heeft nu een knop **"Spelen"** (start de live quiz als host) en een knop **"Verwijderen"** (verwijdert de quiz definitief uit Firebase, na een bevestigingsvraag).

### Live hosten (nieuw)
De quiz wordt nu **live gespeeld door de maker**, net als bij Kahoot:
1. De maker klikt op **"Spelen"** → dit opent een **wachtkamer** met de code op het scherm. De maker moet dit scherm open houden op zijn/haar laptop.
2. Spelers gaan naar "Meedoen aan quiz", vullen de code + hun naam in, en verschijnen live in de wachtkamer van de host.
3. De host klikt op **"Start quiz"**. Iedereen ziet nu tegelijk dezelfde vraag.
4. Spelers klikken een antwoord aan; de host ziet live hoeveel spelers al geantwoord hebben.
5. De host klikt op **"Bekijk scorebord"** → na élke vraag verschijnt een scorebord bij zowel de host als alle spelers.
6. De host klikt op **"Volgende vraag"** tot de laatste vraag, en daarna verschijnt de **eindstand**.

Als een speler een code invoert terwijl de host nog niet op "Spelen" heeft geklikt, krijgt die speler een duidelijke foutmelding dat de quiz nog niet gestart is.

### Puntentelling en scorebord (nieuw)
- Een goed antwoord levert **1000 punten** op.
- Staat het na een vraag gelijk in punten, dan wint degene die (over alle beantwoorde vragen samen) **het snelst klikte** — dus hoe eerder je een goed antwoord geeft, hoe beter je rangschikt bij een gelijke stand.
- Het scorebord toont iedereen gerangschikt van hoog naar laag; spelers zien hun eigen rij gemarkeerd.

### Host verlaat de quiz (nieuw)
Zodra de quizmaster op "Terug" of "Afronden" klikt, of het tabblad sluit / de verbinding verliest (via Firebase `onDisconnect`), wordt de sessie verwijderd. Alle spelers die op dat moment meedoen, zien meteen een scherm dat de quiz gestopt is en kunnen terug naar start.

### Speelbare quizzen (nieuw)
Bij het maken (of bewerken) van een quiz kun je een vinkje "Deze quiz openbaar maken" aanzetten. Zo'n quiz verschijnt dan voor iedereen onder de nieuwe knop **"Speelbare quizzen"** op het startscherm, met omslagfoto en al. Iedereen kan daar op **"Spelen"** klikken om zelf een wachtkamer voor die quiz te openen (net als bij "Mijn quizzen" → Spelen) — je hoeft de code niet meer te kennen of te delen.

Tip voor betere prestaties bij veel quizzen: voeg in de Firebase-regels een index toe op het `openbaar`-veld:
```json
{
  "rules": {
    "quizzen": {
      ".read": true,
      ".write": true,
      ".indexOn": ["openbaar"]
    },
    "sessies": {
      ".read": true,
      ".write": true
    }
  }
}
```
Zonder deze index werkt alles ook gewoon, Firebase geeft dan alleen een waarschuwing in de console bij grotere datasets.

### Sitebeheer (nieuw)
Onderaan elk scherm staat een klein knopje **"Sitebeheer"**. Daar klik je op, vul je een wachtwoord in, en kom je terug op dezelfde pagina — alleen kun je nu bij **"Speelbare quizzen"** per quiz op **"Verwijderen"** klikken. Dat haalt de quiz uit die lijst (hij wordt "niet-openbaar" gezet); de quiz zelf blijft gewoon bestaan voor de maker. Nogmaals op "Sitebeheer" klikken logt je weer uit.

Het wachtwoord staat bovenaan in `app.js` bij `SITEBEHEER_WACHTWOORD` — pas dit aan naar jouw eigen wachtwoord voordat je de site online zet. Let op: dit is alleen een simpele drempel, geen echte beveiliging — het wachtwoord staat gewoon in de broncode en is voor iedereen te vinden die dat zoekt (bijv. via de ontwikkelaarstools van de browser). Gebruik er dus geen wachtwoord voor dat je ergens anders ook gebruikt.

Zodra een quiz zo wordt weggehaald, ziet de maker (op zijn/haar eigen apparaat, onder "Mijn quizzen") bovenaan die quiz een rode melding: "Uw quiz is weggehaald bij openbaar." Met de knop "OK" bij die melding gaat hij weer weg.

## Mogelijke volgende stappen
- Quiz bewerken na het maken.
- Firebase-regels aanscherpen zodat mensen niet zomaar andermans quiz of sessie kunnen overschrijven.
- Punten laten afnemen naarmate je langzamer antwoordt (in plaats van altijd vlak 1000 punten).
