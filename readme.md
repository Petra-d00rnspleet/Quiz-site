# Quiz App — met live hosten en scorebord

## Bestanden
- `index.html` — alle schermen (algemeen, quiz maken, nieuwe quiz, meedoen, wachtkamers, live vraag, scorebord)
- `style.css` — styling
- `app.js` — alle logica (navigatie, opslaan in Firebase, hosten, meedoen, scorebord)
- `poppetjes.js` — de getekende dieren, hoeden, brillen en hartjes (SVG) en hoe die op elkaar passen
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
6. Ga naar **Build → Authentication → Sign-in method** en zet de provider **E-mail/Wachtwoord** aan.
7. Ga naar **Authentication → Users → Add user** en maak het beheerdersaccount aan: vul het e-mailadres en wachtwoord in waarmee jij (of wie de site beheert) later via het "Sitebeheer"-knopje wil inloggen. Dit account staat alleen in Firebase, nergens in de broncode.

## Stap 2: Lokaal testen
Open `index.html` gewoon in je browser (of gebruik een simpele lokale server, bijv. de "Live Server" extensie in VS Code). Open de host-kant en een speler-kant in twee verschillende tabbladen/apparaten om te testen.

## Stap 3: Op GitHub zetten
1. Maak een nieuwe repository op GitHub.
2. Zet deze bestanden erin (`index.html`, `style.css`, `app.js`, `poppetjes.js`, `firebase-config.js`).
3. Ga naar **Settings → Pages** in je repository, kies de `main` branch en map `/root`.
4. Na een minuut is je site live op `https://jouwgebruikersnaam.github.io/repositorynaam/`.

## Hoe het nu werkt

### Naam invullen (verplicht, eenmalig)
Voordat je voor het eerst op "Quiz maken" klikt, vraagt de site om je naam. Die naam:
- wordt lokaal onthouden in je browser en kan daarna **niet meer gewijzigd worden**;
- komt automatisch bij **elke quiz die je maakt** te staan (ook quizzen die je later nog toevoegt);
- is uit privacy **niet zichtbaar voor gewone bezoekers**: bij "Speelbare quizzen" en "Mijn quizzen" staat geen naam. Alleen sitebeheer (ingelogd) ziet "Door <naam>" onder een quiz;
- wordt automatisch ook bij oudere quizzen van dit apparaat gezet die nog geen naam hadden.

Als je op een ander apparaat of in een andere browser inlogt, wordt daar opnieuw om een naam gevraagd (het wordt per browser lokaal onthouden, niet gekoppeld aan een account).

### Quiz maken en verwijderen
- **Quiz maken:** titel + per vraag de vraagtekst en de antwoorden. Per vraag kies je **2 of 4 antwoorden**, en je kunt **meer dan 1 antwoord als goed aanvinken** (in plaats van er maar 1 te kunnen kiezen). Na opslaan krijg je een unieke 6-tekens code en zie je meteen een knop **"Nu hosten"**.
- **Mijn quizzen:** elke quiz heeft nu een knop **"Spelen"** (start de live quiz als host), **"Aanpassen"** (bewerk titel/vragen/omslag) en **"Verwijderen"** (verwijdert de quiz definitief uit Firebase, na een bevestigingsvraag).

### Spelen: met mensen of zonder mensen (nieuw)
Als je bij een quiz op **"Spelen"** klikt (bij "Mijn quizzen" of bij "Speelbare quizzen"), verschijnt eerst een keuze:
- **Met mensen** — je bent de quizmaster en anderen doen mee met een code (zie "Live hosten" hieronder).
- **Zonder mensen** — je speelt de quiz gewoon zelf, zonder quizmaster. Na elke vraag zie je of het goed of fout was, met het goede antwoord. Aan het eind zie je hoeveel vragen je goed had, en kun je opnieuw spelen. Hier wordt niets in Firebase-sessies opgeslagen.

**Alleen spelen toestaan of niet:** bij het openbaar maken van een quiz staat een vinkje **"Spelers mogen deze quiz ook alleen spelen (zonder quizmaster)"** (standaard aan). Zet je dat uit, dan is bij die quiz de optie "Zonder mensen" uitgeschakeld voor andere spelers. Je eigen quiz kun je zelf altijd alleen spelen. Oudere quizzen die deze keuze nog niet hebben, tellen als "alleen spelen mag". Je kunt de keuze altijd wijzigen via "Aanpassen".

### Live hosten (nieuw)
De quiz wordt nu **live gespeeld door de maker**, net als bij Kahoot:
1. De maker klikt op **"Spelen"** → dit opent een **wachtkamer** met de code op het scherm. De maker moet dit scherm open houden op zijn/haar laptop.
2. Spelers gaan naar "Meedoen aan quiz", vullen de code + hun naam in, en verschijnen live in de wachtkamer van de host.
3. De host klikt op **"Start quiz"**. Iedereen ziet nu tegelijk dezelfde vraag.
4. Spelers klikken een antwoord aan; de host ziet live hoeveel spelers al geantwoord hebben. Een speler die heeft geantwoord ziet alleen een **groot laadteken** — nog niet of het goed was.
5. De host klikt op **"Doorgaan"** → er verschijnt één resultaatscherm. De **host** ziet daar het **goede antwoord** in het groot, met een ring en het aantal spelers dat het goed had (bijv. "1 van 1 speler had het goed"). Elke **speler** ziet **goed of fout**, met het goede antwoord eronder. Op dit moment worden ook de punten geteld.
6. De host klikt op **"Doorgaan"** → het **scorebord** verschijnt, zonder de vraag en het antwoord erboven.
7. De host klikt op **"Volgende vraag"** tot de laatste vraag, en daarna verschijnt de **eindstand**.

Als een speler een code invoert terwijl de host nog niet op "Spelen" heeft geklikt, krijgt die speler een duidelijke foutmelding dat de quiz nog niet gestart is.

### Foto bij een vraag (nieuw)
Bij elke vraag kun je (niet verplicht) een **foto uploaden**. De foto wordt verkleind (max. 800 px) en opgeslagen bij de quiz. Tijdens de quiz staat de foto onder de vraag, bij zowel de host als de spelers. Met "Foto verwijderen" haal je hem weer weg; bij "Aanpassen" kun je foto's toevoegen, vervangen of verwijderen.

### Antwoorden: 2 of 4 opties, en meerdere goede antwoorden mogelijk (nieuw)
- Bij het maken van een vraag kies je bij **"Aantal antwoorden"** voor **2** (bijv. waar/niet waar) of **4** antwoorden.
- Bij elk antwoord staat een vinkje. Je kunt **meer dan 1 antwoord als goed aanvinken** — een vraag kan dus 1 of meerdere juiste antwoorden hebben.
- Spelers zien bij zo'n vraag geen directe klik-en-klaar meer: ze **vinken alle antwoorden aan die ze goed vinden** en klikken daarna op **"Antwoord versturen"**. Pas na dat klikken staat hun antwoord vast.
- Een vraag telt alleen als **goed beantwoord** als een speler precies alle juiste antwoorden heeft aangevinkt (niet meer en niet minder).

### Poppetje kiezen: dieren en accessoires (nieuw)
Zodra je meedoet aan een quiz, krijg je een willekeurig dier. In de wachtkamer staan twee tabbladen:
- **Dieren** — kies een ander dier (20 stuks).
- **Accessoires** — kies een hoed (hoge hoed, kroon, afstudeerhoed, pet, cowboyhoed, strohoed, kerstmuts, strik), een bril (zonnebril, gewone bril) en/of een hartje of iets anders (hartjes in 5 kleuren, glitterhartje, ster, glitters, bloem, vuurtje, diamant, klavertje). Per soort kun je er één dragen, dus een hoed, een bril en een hartje tegelijk kan. In het menu zie je bij elk accessoire meteen hoe het op jóuw dier staat. Nog eens op een gekozen accessoire tikken haalt het weer weg, en met "Alle accessoires weghalen" ben je ze allemaal kwijt.

**Alles past precies op het dier.** De dieren zijn zelf getekend (geen emoji-lettertype, want dat ziet er op elk apparaat anders uit), met vaste ankerpunten per dier voor de hoed en de bril. Zo gaat de hoge hoed bij het konijn tussen de oren (de oren staan ervoor), zit de pet tussen de ogen van de kikker, staat de kroon op de manen van de leeuw en zit de bril precies voor de ogen, ook bij de kikker met zijn ogen bovenop het hoofd.

Het poppetje (dier + accessoires) staat bij het scorebord (ook bij de eindstand) **voor je naam**, en bij de host in de wachtkamer. De plekken (#1, #2, #3 …) blijven gewoon links staan. Nadat de quiz is begonnen kun je je poppetje niet meer wijzigen.

**Aanpassen of uitbreiden** kan allemaal in `poppetjes.js`:
- Zit een hoed bij één dier net verkeerd? Pas bij dat dier `kruin` (positie en breedte van de hoed) of `ogen` (bril) aan.
- Nieuw accessoire? Voeg het toe aan `ACCESSOIRES` en aan `ACCESSOIRE_GROEPEN`.
- Nieuw dier? Voeg een tekening toe aan `DIER_TEKENINGEN`.
In Firebase staan de keuzes bij de speler onder `dier` en `accessoires/<plek>`; de bestaande regels voor `sessies` hoeven niet te veranderen.

### Puntentelling en scorebord (nieuw)
- Een goed antwoord levert **1000 punten** op.
- Staat het na een vraag gelijk in punten, dan wint degene die (over alle beantwoorde vragen samen) **het snelst klikte** — dus hoe eerder je op "Antwoord versturen" klikt bij een goed antwoord, hoe beter je rangschikt bij een gelijke stand.
- Het scorebord toont iedereen gerangschikt van hoog naar laag, met plek, dier en naam; spelers zien hun eigen rij gemarkeerd.

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

### Sitebeheer (nieuw, met echt account via Firebase Authentication)
Onderaan elk scherm staat een klein knopje **"Sitebeheer"**. Daar klik je op, log je in met het e-mailadres + wachtwoord van het beheerdersaccount (zie Stap 1 hierboven), en kom je terug op dezelfde pagina — alleen kun je nu bij **"Speelbare quizzen"** per quiz op **"Aanpassen"** of **"Verwijderen"** klikken:
- **Aanpassen:** opent hetzelfde bewerkformulier als bij "Mijn quizzen", zodat sitebeheer de titel, vragen, antwoorden en omslagfoto van elke openbare quiz kan wijzigen — ook van quizzen die door iemand anders zijn gemaakt. Na opslaan (of op "Terug" klikken) kom je weer terug bij "Speelbare quizzen".
- **Verwijderen:** haalt de quiz uit die lijst (hij wordt "niet-openbaar" gezet); de quiz zelf blijft gewoon bestaan voor de maker.

- **Namen zichtbaar:** alleen als je bent ingelogd zie je bij elke quiz "Door <naam>" (of "naam onbekend"). Uitgelogd zie je nergens namen.
- **Alle quizmakers:** zolang je bent ingelogd staat bovenaan "Speelbare quizzen" een **inklapbaar venster** (klik op de titel om in of uit te klappen) met een overzicht van álle makers, ook van quizzen die niet openbaar zijn of zijn weggehaald. Per maker zie je de quizzen, codes en status. Quizzen zonder naam staan onder "Naam onbekend".

Nogmaals op "Sitebeheer" klikken logt je weer uit.

Dit inloggen verloopt via **Firebase Authentication**, niet via een wachtwoord in de broncode: de inloggegevens staan alleen in de Firebase Console, dus niemand kan ze terugvinden door in de bestanden van de site te kijken. Firebase onthoudt bovendien dat je bent ingelogd, dus na het herladen van de pagina blijf je ingelogd totdat je bewust uitlogt. Wil je meerdere mensen sitebeheerder maken? Voeg dan in Firebase Console → Authentication → Users gewoon nog een gebruiker toe.

Let op: dit account beschermt alleen de knop in de website zelf. De Firebase-regels hieronder staan nog steeds iedereen toe om in `quizzen` en `sessies` te lezen en schrijven (dat is nodig omdat gewone bezoekers zonder account al hun eigen quizzen kunnen maken/spelen). Wil je dat ook op databaseniveau afschermen, dan is dat een grotere aanpassing van de regels — laat het weten als je dat ook wil.

Zodra een quiz zo wordt weggehaald, ziet de maker (op zijn/haar eigen apparaat, onder "Mijn quizzen") bovenaan die quiz een rode melding: "Uw quiz is weggehaald bij openbaar." Met de knop "OK" bij die melding gaat hij weer weg.

### Quiz blokkeren (nieuw)
Naast "Verwijderen" (die een quiz alleen uit de lijst haalt) kan sitebeheer een quiz nu ook **blokkeren**. Een geblokkeerde quiz:
- gaat direct offline (staat niet meer bij "Speelbare quizzen");
- kan door de maker **niet meer openbaar gezet worden** — in het bewerkformulier staat het vinkje "Deze quiz openbaar maken" uitgezet en op slot, met een duidelijke melding erbij, totdat sitebeheer de quiz weer deblokkeert.

Twee plekken om te blokkeren/deblokkeren:
- Bij **"Speelbare quizzen"** staat, naast "Aanpassen" en "Verwijderen", nu ook een knop **"Blokkeren"** (voor quizzen die op dat moment openbaar staan).
- In het inklapbare overzicht **"Alle quizmakers"** (bovenaan "Speelbare quizzen") staat bij élke quiz — ook niet-openbare — een klein knopje **"Blokkeren"** of **"Deblokkeren"**. Dit is de plek om een quiz te blokkeren die nog niet (of niet meer) openbaar staat, zodat hij ook in de toekomst niet openbaar gezet kan worden.

De maker zelf ziet bij "Mijn quizzen" een gele melding op een geblokkeerde quiz ("Deze quiz is geblokkeerd door sitebeheer en kan niet openbaar gezet worden.") en kan gewoon spelen/hosten, maar niet meer op "openbaar" zetten.

## Mogelijke volgende stappen
- Firebase-regels aanscherpen zodat mensen niet zomaar andermans quiz of sessie kunnen overschrijven.
- Punten laten afnemen naarmate je langzamer antwoordt (in plaats van altijd vlak 1000 punten).
- Gedeeltelijke punten geven als een speler bij een vraag met meerdere goede antwoorden er een paar goed heeft, maar niet allemaal.
