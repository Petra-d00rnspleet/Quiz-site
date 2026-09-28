Quiz App — met live hosten en scorebord

Bestanden

index.html — alle schermen (algemeen, quiz maken, nieuwe quiz, meedoen, wachtkamers, live vraag, scorebord)

style.css — styling

app.js — alle logica (navigatie, opslaan in Firebase, hosten, meedoen, scorebord)

poppetjes.js — de getekende dieren, hoeden, brillen en hartjes (SVG) en hoe die op elkaar passen

firebase-config.js — hier vul je jouw eigen Firebase-gegevens in (ongewijzigd)

firebase-rules.json — de volledige Firebase-regels (dezelfde tekst staat ook onderaan deze readme)

Stap 1: Firebase instellen (uitgebreid)

Alles hieronder doe je één keer in de Firebase Console (https://console.firebase.google.com). Doe je iets veranderen aan de regels, dan publiceer je ze opnieuw (zie "Firebase-regels" verderop).

1A. Project en database
1. Maak een project (of open je bestaande project "quizwebsite").
2. Build → Realtime Database → Database maken. Kies een regio (bijv. Europe) en start in "vergrendelde modus"; de regels vervang je zo meteen.

1B. Web-app koppelen
3. Project instellingen (tandwiel) → Algemeen → Jouw apps → Web-app (</>) → registreer een app.
4. Kopieer de firebaseConfig naar firebase-config.js. Let op dat databaseURL erin staat.

1C. Aanmelden (Authentication) — hier gaat het het vaakst mis
5. Build → Authentication → Aan de slag.
6. Tabblad "Sign-in method" → zet **Anoniem** aan → Opslaan. Gewone spelers krijgen hiermee een eigen onzichtbaar account. ZONDER DIT WERKEN VRIENDEN EN CHAT ALLEEN VOOR SITEBEHEER.
7. Zet op dezelfde plek **E-mail/Wachtwoord** aan (voor het sitebeheer-account).
8. Tabblad "Users" → Add user → maak het beheerdersaccount (e-mail + wachtwoord voor het Sitebeheer-knopje). Het staat alleen in Firebase, nergens in de code.
9. Tabblad "Instellingen" → "Geautoriseerde domeinen": zorg dat het domein van je site erin staat, bijv. jouwnaam.github.io (localhost staat er standaard al in). Staat je domein er niet in, dan mislukt aanmelden op je echte site.

1D. Regels publiceren
10. Realtime Database → tabblad "Regels".
11. Verwijder ALLES wat er staat en plak de volledige regels uit het kopje "Firebase-regels (volledig)" hieronder (of de inhoud van firebase-rules.json).
12. Klik op "Publiceren". Zie je een rode fout, dan is er niet alles geplakt of iets extra's meegekopieerd.

1E. Website bijwerken
13. Zet de nieuwste index.html, style.css, app.js, poppetjes.js en firebase-config.js op GitHub (of je hostingplek), wacht een minuut en herlaad de site met Ctrl+F5 (op telefoon: cache wissen of privévenster).

Zo test je of vrienden en chat werken voor gewone spelers
- Open de site in twee verschillende browsers (of één gewoon venster en één privévenster), NIET ingelogd bij sitebeheer.
- Maak in elk een profiel met een andere naam, zoek elkaar bij Vrienden → Toevoegen, stuur een verzoek, accepteer en chat.
- Wil je zien wat er misgaat: druk op F12 → tabblad Console. Firebase noemt daar de foutcode.

Wat betekent welke foutmelding?
- auth/operation-not-allowed of "Anoniem" in de melding bij Vrienden → stap 6 is niet gedaan (Anoniem staat uit).
- auth/unauthorized-domain → stap 9: je domein staat niet bij Geautoriseerde domeinen.
- PERMISSION_DENIED (bij zoeken, vriendschapsverzoek, chatten) → de regels zijn niet (volledig) gepubliceerd, of er staat een oude/eigen regel tussen. Plak de regels hieronder opnieuw.
- Alles werkt alleen als je bij sitebeheer bent ingelogd → bijna altijd stap 6 of 9. Ingelogd als beheerder heb je namelijk wel een account; gewone spelers niet.
- Een speler heeft na wissen van browsergegevens ineens een nieuw account: anonieme accounts leven in de browser. Wis je de browserdata, dan is het oude account weg (vrienden en chat van dat account dus ook). Dat is normaal bij anoniem aanmelden.

Let op: quizzen, sessies, mysterieboxen, geluksrad en aangepastePoppetjes zijn open voor iedereen (zoals eerder). Voor een echt project wil je later strengere regels.

Stap 2: Lokaal testen

Open index.html gewoon in je browser (of gebruik een simpele lokale server, bijv. de "Live Server" extensie in VS Code). Open de host-kant en een speler-kant in twee verschillende tabbladen/apparaten om te testen.

Stap 3: Op GitHub zetten

Maak een nieuwe repository op GitHub.

Zet deze bestanden erin (index.html, style.css, app.js, poppetjes.js, firebase-config.js).

Ga naar Settings → Pages in je repository, kies de main branch en map /root.

Na een minuut is je site live op https://jouwgebruikersnaam.github.io/repositorynaam/.

Hoe het nu werkt

Naam invullen (verplicht, eenmalig)

Voordat je voor het eerst op "Quiz maken" klikt, vraagt de site om je naam. Die naam:

wordt lokaal onthouden in je browser en kan daarna wel gewijzigd worden via je profiel (rechtsboven);

komt automatisch bij elke quiz die je maakt te staan (ook quizzen die je later nog toevoegt);

is uit privacy niet zichtbaar voor gewone bezoekers: bij "Speelbare quizzen" en "Mijn quizzen" staat geen naam. Alleen sitebeheer (ingelogd) ziet "Door <naam>" onder een quiz;

wordt automatisch ook bij oudere quizzen van dit apparaat gezet die nog geen naam hadden.

Als je op een ander apparaat of in een andere browser inlogt, wordt daar opnieuw om een naam gevraagd (het wordt per browser lokaal onthouden, niet gekoppeld aan een account).

Quiz maken en verwijderen

Quiz maken: titel + per vraag de vraagtekst en de antwoorden. Per vraag kies je 2 of 4 antwoorden, en je kunt meer dan 1 antwoord als goed aanvinken (in plaats van er maar 1 te kunnen kiezen). Na opslaan krijg je een unieke 6-tekens code en zie je meteen een knop "Nu hosten".

Mijn quizzen: elke quiz heeft nu een knop "Spelen" (start de live quiz als host), "Aanpassen" (bewerk titel/vragen/omslag) en "Verwijderen" (verwijdert de quiz definitief uit Firebase, na een bevestigingsvraag).

Spelen: met mensen of zonder mensen (nieuw)

Als je bij een quiz op "Spelen" klikt (bij "Mijn quizzen" of bij "Speelbare quizzen"), verschijnt eerst een keuze:

Met mensen — je bent de quizmaster en anderen doen mee met een code (zie "Live hosten" hieronder).

Zonder mensen — je speelt de quiz gewoon zelf, zonder quizmaster. Na elke vraag zie je of het goed of fout was, met het goede antwoord. Aan het eind zie je hoeveel vragen je goed had, en kun je opnieuw spelen. Hier wordt niets in Firebase-sessies opgeslagen.

Alleen spelen toestaan of niet: bij het openbaar maken van een quiz staat een vinkje "Spelers mogen deze quiz ook alleen spelen (zonder quizmaster)" (standaard aan). Zet je dat uit, dan is bij die quiz de optie "Zonder mensen" uitgeschakeld voor andere spelers. Je eigen quiz kun je zelf altijd alleen spelen. Oudere quizzen die deze keuze nog niet hebben, tellen als "alleen spelen mag". Je kunt de keuze altijd wijzigen via "Aanpassen".

Tijd per vraag / wekker (nieuw)

Bij het maken (of aanpassen) van een quiz kies je bij "Tijd per vraag (bij live hosten)" een tijd: 10, 15, 20, 25 of 30 seconden (standaard 20). Tijdens live hosten ("Met mensen") telt op het scherm van de quizmaster een klokje af zodra een vraag begint. Loopt de tijd af, dan gaat de host automatisch door naar het resultaatscherm — precies zoals bij zelf op "Doorgaan" klikken. De quizmaster mag ook altijd eerder op "Doorgaan" klikken. Spelers zien deze klok niet, alleen de quizmaster. Oudere quizzen zonder deze instelling gebruiken 20 seconden. Bij "Zonder mensen" (solo spelen) is er geen tijdslimiet; daar kun je rustig nadenken.

Live hosten (nieuw)

De quiz wordt nu live gespeeld door de maker, net als bij Kahoot:

De maker klikt op "Spelen" → dit opent een wachtkamer met de code op het scherm. De maker moet dit scherm open houden op zijn/haar laptop.

Spelers gaan naar "Meedoen aan quiz", vullen de code + hun naam in, en verschijnen live in de wachtkamer van de host.

De host klikt op "Start quiz". Iedereen ziet nu tegelijk dezelfde vraag.

Spelers klikken een antwoord aan; de host ziet live hoeveel spelers al geantwoord hebben. Een speler die heeft geantwoord ziet alleen een groot laadteken — nog niet of het goed was.

De host klikt op "Doorgaan" → er verschijnt één resultaatscherm. De host ziet daar het goede antwoord in het groot, met een ring en het aantal spelers dat het goed had (bijv. "1 van 1 speler had het goed"). Elke speler ziet goed of fout, met het goede antwoord eronder. Op dit moment worden ook de punten geteld.

De host klikt op "Doorgaan" → het scorebord verschijnt, zonder de vraag en het antwoord erboven.

De host klikt op "Volgende vraag" tot de laatste vraag, en daarna verschijnt de eindstand.

Als een speler een code invoert terwijl de host nog niet op "Spelen" heeft geklikt, krijgt die speler een duidelijke foutmelding dat de quiz nog niet gestart is.

Foto bij een vraag (nieuw)

Bij elke vraag kun je (niet verplicht) een foto uploaden. De foto wordt verkleind (max. 800 px) en opgeslagen bij de quiz. Tijdens de quiz staat de foto onder de vraag, bij zowel de host als de spelers. Met "Foto verwijderen" haal je hem weer weg; bij "Aanpassen" kun je foto's toevoegen, vervangen of verwijderen.

Antwoorden: 2 of 4 opties, en meerdere goede antwoorden mogelijk (nieuw)

Bij het maken van een vraag kies je bij "Aantal antwoorden" voor 2 (bijv. waar/niet waar) of 4 antwoorden.

Bij elk antwoord staat een vinkje. Je kunt meer dan 1 antwoord als goed aanvinken — een vraag kan dus 1 of meerdere juiste antwoorden hebben.

Spelers zien bij zo'n vraag geen directe klik-en-klaar meer: ze vinken alle antwoorden aan die ze goed vinden en klikken daarna op "Antwoord versturen". Pas na dat klikken staat hun antwoord vast.

Een vraag telt alleen als goed beantwoord als een speler precies alle juiste antwoorden heeft aangevinkt (niet meer en niet minder).

Poppetje kiezen: dieren en accessoires (aangepast: nu met een winkel)

Iedereen begint gratis met maar twee dieren (hond en kat) en één accessoire (zonnebril). Zodra je meedoet aan een quiz, krijg je willekeurig één van je eigen dieren. In de wachtkamer staan twee tabbladen:

Dieren — kies een ander dier uit wat je zelf al bezit.

Accessoires — kies uit de accessoires die je zelf al bezit (bijv. de zonnebril). Nog eens op een gekozen accessoire tikken haalt het weer weg, en met "Alle accessoires weghalen" ben je ze allemaal kwijt.

Bezit je meer dieren of accessoires dan de standaard twee, dan staan die er gewoon ook bij. Onderaan het keuzemenu staat een hint naar de winkel zolang je nog niet alles hebt.

Alles past precies op het dier. De dieren zijn zelf getekend (geen emoji-lettertype, want dat ziet er op elk apparaat anders uit), met vaste ankerpunten per dier voor de hoed en de bril. Zo gaat de hoge hoed bij het konijn tussen de oren (de oren staan ervoor), zit de pet tussen de ogen van de kikker, staat de kroon op de manen van de leeuw en zit de bril precies voor de ogen, ook bij de kikker met zijn ogen bovenop het hoofd. Al deze extra dieren en accessoires (18 andere dieren, 8 hoeden, een gewone bril, 12 hartjes-en-meer) bestaan nog gewoon in de code — ze zijn alleen niet meer standaard te kiezen, maar zitten klaar om door sitebeheer in mysterieboxen gestopt te worden (zie hieronder).

Het poppetje (dier + accessoires) staat bij het scorebord (ook bij de eindstand) voor je naam, en bij de host in de wachtkamer. De plekken (#1, #2, #3 …) blijven gewoon links staan. Nadat de quiz is begonnen kun je je poppetje niet meer wijzigen.

Aanpassen of uitbreiden kan allemaal in poppetjes.js:

Zit een hoed bij één dier net verkeerd? Pas bij dat dier kruin (positie en breedte van de hoed) of ogen (bril) aan.

Nieuw accessoire? Voeg het toe aan ACCESSOIRES en aan ACCESSOIRE_GROEPEN.

Nieuw dier? Voeg een tekening toe aan DIER_TEKENINGEN.
In Firebase staan de keuzes bij de speler onder dier en accessoires/<plek>; de bestaande regels voor sessies hoeven niet te veranderen.

Puntentelling en scorebord (nieuw)

Bij het maken (of aanpassen) van een quiz kies je per vraag bij "Punten voor een goed antwoord" hoeveel punten die vraag oplevert (standaard 1000, zelf aan te passen in stapjes van 50). Tijdens live hosten ziet zowel de quizmaster als de spelers boven de vraag hoeveel punten hij waard is. Oudere vragen zonder deze instelling tellen gewoon als 1000 punten, zoals voorheen.

Staat het na een vraag gelijk in punten, dan wint degene die (over alle beantwoorde vragen samen) het snelst klikte — dus hoe eerder je op "Antwoord versturen" klikt bij een goed antwoord, hoe beter je rangschikt bij een gelijke stand.

Het scorebord toont iedereen gerangschikt van hoog naar laag, met plek, dier en naam; spelers zien hun eigen rij gemarkeerd.

Bij "Zonder mensen" (solo spelen) is er geen puntentelling; daar zie je aan het eind gewoon hoeveel vragen je goed had.

Munten en de winkel: mysterieboxen (nieuw)

Win je een live quiz ("Met mensen") — dus sta je bij de eindstand op #1 — dan krijg je automatisch 100 munten. Je munten zie je bovenaan het startscherm en bovenaan de winkel; ze worden net als je naam lokaal in je browser onthouden (er is geen account voor gewone spelers).

Op het startscherm staat de knop 🎁 Winkel. Daar koop je met munten mysterieboxen: een box heeft een naam, een prijs en verborgen inhoud (een aantal dieren en/of accessoires). Koop je een box, dan wordt hij meteen geopend: je krijgt en houdt voorgoed alles wat erin zat (geen dubbelen als je iets al had), en je munten gaan met de prijs omlaag. Wat je zo wint, staat vanaf dan gewoon tussen je eigen dieren/accessoires in de wachtkamer.

Boxen ontwerpen doet sitebeheer (zie hieronder voor inloggen): log in en ga naar de Winkel. Daar staat nu een knop "+ Nieuwe mysteriebox maken", en bij elke bestaande box "Aanpassen" en "Verwijderen". In het ontwerpvenster vul je een naam en een prijs (in munten) in, en vink je aan welke dieren en/of accessoires erin moeten zitten (uit de hele catalogus van poppetjes.js, dus ook de 18 dieren en alle hoeden/hartjes die niet meer standaard te kiezen zijn). Een box verwijderen haalt hem uit de winkel; spelers die hem al gekocht hadden, houden gewoon wat ze kregen.

Boxen staan in Firebase onder een nieuw pad mysterieboxen naast quizzen en sessies — zorg dat je de Firebase-regel hiervoor hebt toegevoegd (zie Stap 1 hierboven), anders kan de winkel niet laden of opslaan.

Kist later te koop zetten of offline halen (nieuw)

In het ontwerpvenster van een kist staat nu ook "Te koop vanaf (optioneel)": vul je hier een datum in de toekomst in, dan is de kist standaard nog helemaal onzichtbaar voor spelers totdat die datum is aangebroken. Daaronder staat het vinkje "Spelers mogen al zien dat deze kist eraan komt (naam, prijs en datum), maar kunnen hem nog niet kopen": zet je dat aan, dan verschijnt de kist alvast in de winkel bij spelers met het label "⏳ Binnenkort — te koop vanaf ...", met een uitgegrijsde "Nog niet te koop"-knop (zonder dat ze zien wat erin zit). Heb je bij die kist ook een "Automatisch offline vanaf"-datum ingesteld, dan zien spelers er meteen bij tot wanneer de kist er dan zal zijn ("⏳ Binnenkort — te koop van ... tot ..."). Is een kist eenmaal gewoon te koop en heeft hij zo'n tot-datum, dan blijven spelers ook daarna zien "⏳ Nog te koop tot ...", zodat ze weten hoelang ze nog de tijd hebben. Laat je het vinkje uit, dan blijft de kist volledig verborgen tot de vanaf-datum, zoals voorheen. Boven de winkel-lijst staat voor sitebeheer een inklapbaar overzicht "🔜 Kisten die nog komen", met alle kisten die nog een toekomstige vanaf-datum hebben, op datum gesorteerd (eerstkomende bovenaan) en met een aanduiding of spelers hem al kunnen zien.

Daarnaast staat er "Automatisch offline vanaf (optioneel)": vul je hier een datum in, dan verdwijnt de kist die dag vanzelf uit de winkel voor gewone spelers (net als bij handmatig "Offline halen"), met een label "🔒 Automatisch offline sinds ..." voor sitebeheer. Laat je dit veld leeg, dan blijft de kist gewoon online totdat je hem zelf offline haalt of verwijdert.

Bij elke kist staat voor sitebeheer nu ook een knop "📴 Offline halen" / "📶 Online zetten". Offline gehaalde kisten ("🔒 Offline") zijn alleen nog zichtbaar voor sitebeheer, totdat ze weer online gezet worden — handig om een kist tijdelijk te verbergen zonder hem te verwijderen.

In het ontwerpvenster staat bij elk dier en accessoire nu een getalletje als het al in een andere kist zit, zodat je in één oogopslag ziet wat al eerder gebruikt is.

Geluksrad (nieuw)

Op het startscherm staat nu ook de knop 🎡 Geluksrad. Iedereen (ook zonder in te loggen) mag daar 1 keer per dag gratis aan het rad draaien door op de knop in het midden te klikken: het rad draait een paar rondjes en komt vanzelf op een vak uit, en dat aantal munten krijg je meteen. Draai je vandaag al eens, dan zie je een teller "Kom morgen terug" en is de knop uitgegrijsd tot de volgende dag (bijgehouden per browser, net als de munten zelf — geen account nodig).

Sitebeheer ontwerpt de vakken op het rad: log in en ga naar het Geluksrad, daar staat nu de knop "⚙ Rad aanpassen". In dat venster staat per vak een keuze wat voor beloning het is — 💰 Munten, 🐾 Dier of 🎩 Accessoire — met daaronder het bijbehorende veld: een aantal munten, of een dier/accessoire gekozen uit de hele catalogus van poppetjes.js (dus ook de dieren en accessoires die niet standaard te kiezen zijn). Win je een dier of accessoire op het rad, dan komt het er meteen bij in je verzameling, net als bij een mysteriebox (geen dubbelen als je het al had). Daarnaast vul je optioneel een naam in (leeg laten toont gewoon "X munten", of het gekozen dier/accessoire zelf) en een "kans"-getal. Dat kans-getal bepaalt hoe groot het vak op het rad wordt getekend: een vak met kans 3 is drie keer zo breed (en wordt dus drie keer zo vaak gewonnen) als een vak met kans 1. Zo bepaal jij precies waar het rad het vaakst en het minst op moet uitkomen, gewoon door de vakken groter of kleiner te maken. Met "+ Vak toevoegen" en de ✕ bij elke rij voeg je vakken toe of haal je ze weg (minimaal 2 vakken nodig). Is er nog nooit iets ingesteld, dan gebruikt het rad een standaardset vakken zodat het meteen werkt.

Het rad staat in Firebase onder een nieuw pad geluksrad naast mysterieboxen, quizzen en sessies — zorg dat je ook hiervoor de Firebase-regel hebt toegevoegd (zie Stap 1 hierboven), anders kan het rad niet laden of opslaan.

Host verlaat de quiz (nieuw)

Zodra de quizmaster op "Terug" of "Afronden" klikt, of het tabblad sluit / de verbinding verliest (via Firebase onDisconnect), wordt de sessie verwijderd. Alle spelers die op dat moment meedoen, zien meteen een scherm dat de quiz gestopt is en kunnen terug naar start.

Speelbare quizzen (nieuw)

Bij het maken (of bewerken) van een quiz kun je een vinkje "Deze quiz openbaar maken" aanzetten. Zo'n quiz verschijnt dan voor iedereen onder de nieuwe knop "Speelbare quizzen" op het startscherm, met omslagfoto en al. Iedereen kan daar op "Spelen" klikken om zelf een wachtkamer voor die quiz te openen (net als bij "Mijn quizzen" → Spelen) — je hoeft de code niet meer te kennen of te delen.

Tip voor betere prestaties bij veel quizzen: de complete regels bij Stap 1 hierboven bevatten al een index op het openbaar-veld (".indexOn": ["openbaar"]). Zonder die index werkt alles ook gewoon, Firebase geeft dan alleen een waarschuwing in de console bij grotere datasets.

Sitebeheer (nieuw, met echt account via Firebase Authentication)

Onderaan elk scherm staat een klein knopje "Sitebeheer". Daar klik je op, log je in met het e-mailadres + wachtwoord van het beheerdersaccount (zie Stap 1 hierboven), en kom je terug op dezelfde pagina — alleen kun je nu bij "Speelbare quizzen" per quiz op "Aanpassen" of "Verwijderen" klikken:

Aanpassen: opent hetzelfde bewerkformulier als bij "Mijn quizzen", zodat sitebeheer de titel, vragen, antwoorden en omslagfoto van elke openbare quiz kan wijzigen — ook van quizzen die door iemand anders zijn gemaakt. Na opslaan (of op "Terug" klikken) kom je weer terug bij "Speelbare quizzen".

Verwijderen: haalt de quiz uit die lijst (hij wordt "niet-openbaar" gezet); de quiz zelf blijft gewoon bestaan voor de maker.

Namen zichtbaar: alleen als je bent ingelogd zie je bij elke quiz "Door <naam>" (of "naam onbekend"). Uitgelogd zie je nergens namen.

Alle quizmakers: zolang je bent ingelogd staat bovenaan "Speelbare quizzen" een inklapbaar venster (klik op de titel om in of uit te klappen) met een overzicht van álle makers, ook van quizzen die niet openbaar zijn of zijn weggehaald. Per maker zie je de quizzen, codes en status. Quizzen zonder naam staan onder "Naam onbekend".

Nogmaals op "Sitebeheer" klikken logt je weer uit.

Dit inloggen verloopt via Firebase Authentication, niet via een wachtwoord in de broncode: de inloggegevens staan alleen in de Firebase Console, dus niemand kan ze terugvinden door in de bestanden van de site te kijken. Firebase onthoudt bovendien dat je bent ingelogd, dus na het herladen van de pagina blijf je ingelogd totdat je bewust uitlogt. Wil je meerdere mensen sitebeheerder maken? Voeg dan in Firebase Console → Authentication → Users gewoon nog een gebruiker toe.

Let op: dit account beschermt alleen de knop in de website zelf. De Firebase-regels hieronder staan nog steeds iedereen toe om in quizzen en sessies te lezen en schrijven (dat is nodig omdat gewone bezoekers zonder account al hun eigen quizzen kunnen maken/spelen). Wil je dat ook op databaseniveau afschermen, dan is dat een grotere aanpassing van de regels — laat het weten als je dat ook wil.

Zodra een quiz zo wordt weggehaald, ziet de maker (op zijn/haar eigen apparaat, onder "Mijn quizzen") bovenaan die quiz een rode melding: "Uw quiz is weggehaald bij openbaar." Met de knop "OK" bij die melding gaat hij weer weg.

Quiz blokkeren (nieuw)

Naast "Verwijderen" (die een quiz alleen uit de lijst haalt) kan sitebeheer een quiz nu ook blokkeren. Een geblokkeerde quiz:

gaat direct offline (staat niet meer bij "Speelbare quizzen");

kan door de maker niet meer openbaar gezet worden — in het bewerkformulier staat het vinkje "Deze quiz openbaar maken" uitgezet en op slot, met een duidelijke melding erbij, totdat sitebeheer de quiz weer deblokkeert.

Twee plekken om te blokkeren/deblokkeren:

Bij "Speelbare quizzen" staat, naast "Aanpassen" en "Verwijderen", nu ook een knop "Blokkeren" (voor quizzen die op dat moment openbaar staan).

In het inklapbare overzicht "Alle quizmakers" (bovenaan "Speelbare quizzen") staat bij élke quiz — ook niet-openbare — een klein knopje "Blokkeren" of "Deblokkeren". Dit is de plek om een quiz te blokkeren die nog niet (of niet meer) openbaar staat, zodat hij ook in de toekomst niet openbaar gezet kan worden.

De maker zelf ziet bij "Mijn quizzen" een gele melding op een geblokkeerde quiz ("Deze quiz is geblokkeerd door sitebeheer en kan niet openbaar gezet worden.") en kan gewoon spelen/hosten, maar niet meer op "openbaar" zetten.

Poppetje wijzigen (nieuw)

Rechtsboven op je poppetje > "Poppetje wijzigen" opent een beeldvullend scherm met een groot voorbeeld, wat je nu aanhebt, en tabbladen voor Dieren, Hoeden, Brillen en Extra. Tik op een kaartje om te kiezen. Publiceer voor het verwijderen van berichten de nieuwste firebase-rules.json.

Gebruikersnaam wijzigen en vrienden zoeken (nieuw)

Je gebruikersnaam is nu te wijzigen: klik rechtsboven op je poppetje en kies "Gebruikersnaam wijzigen". De nieuwe naam moet nog vrij zijn; je oude naam komt daarna weer vrij. De naam wordt ook bijgewerkt bij je vrienden en bij je eigen quizzen. Vrienden zoeken werkt nu zoals quizzen zoeken: live terwijl je typt, hoofdletterongevoelig en op elk deel van de naam. Publiceer daarvoor de nieuwste firebase-rules.json.

Vrienden en chat (nieuw)

De chat met een vriend is beeldvullend. Met 🎨 bovenin kies je een achtergrond en de kleur van de tekstvakjes, apart voor je eigen berichten en die van je vriend (wordt per chat onthouden in je browser). Je eigen berichten kun je verwijderen met de 🗑. Met 📝 naast het schrijfvak stuur je een quiz: als je vriend accepteert staat hij ook bij zijn Mijn quizzen (dezelfde quiz, dus jullie kunnen hem allebei aanpassen). Bij de chat-knop van een vriend staat een cijfertje met het aantal ongelezen berichten; bij de knop "Vrienden" rechtsboven staan de nieuwe berichten en verzoeken samen. Naast het schrijfvak staat een knopje met je poppetje en een plusje: daar kies je een dier of accessoire uit je verzameling en verstuur je het. Het staat als cadeaukaart in de chat; de ander kan accepteren of weigeren. Pas bij accepteren heeft de verzender er één minder en de ontvanger er één erbij. Je laatste dier of accessoire kun je niet versturen. In de chat staat het poppetje van je vriend (en van jezelf) voor de naam, in de kop, bij elk bericht en in de vriendenlijst.

Mogelijke volgende stappen

Firebase-regels aanscherpen zodat mensen niet zomaar andermans quiz of sessie kunnen overschrijven.

Bij een gelijke eindstand op #1 krijgt nu maar één speler de winnaarsmunten (degene die als eerste in de sorteervolgorde staat, dus de snelste van de twee) — dat zou je kunnen veranderen naar "iedereen op #1 krijgt munten".

Punten laten afnemen naarmate je langzamer antwoordt (in plaats van altijd vlak 1000 punten).

Gedeeltelijke punten geven als een speler bij een vraag met meerdere goede antwoorden er een paar goed heeft, maar niet allemaal.

Nieuwe functie: eigen poppetjes en accessoires

Eigen poppetjes maken zit nu gewoon in het scherm waar je een kist (mysteriebox) maakt of aanpast — geen apart scherm meer. Onderaan dat scherm staat "🎨 Nieuw poppetje toevoegen": een heel raster met emoji (allerlei gezichtjes/emoties en een paar dieren). Klik je op een emoji, dan wordt hij meteen een nieuw poppetje, precies zoals de bestaande dieren erboven, en staat hij meteen aangevinkt in de kist die je op dat moment aan het maken bent. Naam en kleur hoef je niet zelf in te vullen: de naam wordt de emoji zelf en de kleur wordt automatisch gekozen uit een vaste kleurenset.

Eronder staat op dezelfde manier "🎨 Nieuw accessoire toevoegen": kies eerst de plek (🎩 bovenop het hoofd, 👓 op het gezicht, of ✨ naast het hoofd) en klik dan op een emoji — die komt er meteen op die plek bij, ook weer meteen aangevinkt in de kist.

Nieuwe Firebase-tak: aangepastePoppetjes — zit al in het complete regel-blok bij Stap 1 hierboven.

Voor een echte openbare site zijn strengere Firebase-regels aan te raden.

Firebase-regels (volledig)

Plak dit in Realtime Database → Regels → Publiceren. Dezelfde tekst staat in firebase-rules.json. Bij elke wijziging in de app die nieuwe regels nodig heeft, wordt dit blok en het wijzigingslogboek hieronder bijgewerkt.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "quizzen": {
      ".read": true,
      ".write": true,
      ".indexOn": [
        "openbaar"
      ]
    },
    "sessies": {
      ".read": true,
      ".write": true
    },
    "mysterieboxen": {
      ".read": true,
      ".write": true
    },
    "geluksrad": {
      ".read": true,
      ".write": true
    },
    "aangepastePoppetjes": {
      ".read": true,
      ".write": true
    },
    "gebruikers": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid",
        "bezit": {
          "dieren": {
            "$item": {
              ".write": "auth != null",
              ".validate": "newData.isNumber() && newData.val() >= 0"
            }
          },
          "accessoires": {
            "$item": {
              ".write": "auth != null",
              ".validate": "newData.isNumber() && newData.val() >= 0"
            }
          }
        }
      }
    },
    "gebruikersnamen": {
      ".read": "auth != null",
      "$naam": {
        ".write": "auth != null && ((!data.exists() && newData.val() === auth.uid) || (data.exists() && data.val() === auth.uid))",
        ".validate": "newData.isString()"
      }
    },
    "vrienden": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$vriend": {
          ".write": "auth != null && (auth.uid === $uid || (auth.uid === $vriend && (data.exists() || root.child('vriendschapsverzoeken').child(auth.uid).child($uid).exists())))"
        }
      }
    },
    "vriendschapsverzoeken": {
      "$ontvanger": {
        ".read": "auth != null && auth.uid === $ontvanger",
        "$afzender": {
          ".read": "auth != null && auth.uid === $afzender",
          ".write": "auth != null && (auth.uid === $afzender || auth.uid === $ontvanger)",
          ".validate": "!newData.exists() || newData.child('uid').val() === $afzender"
        }
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && ($chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid))",
        "berichten": {
          "$key": {
            ".write": "auth != null && ($chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid)) && ((!data.exists() && newData.child('uid').val() === auth.uid) || (data.exists() && !newData.exists() && data.child('uid').val() === auth.uid && data.child('status').val() !== 'bezig') || (data.exists() && newData.exists() && newData.child('uid').val() === data.child('uid').val() && newData.child('tekst').val() === data.child('tekst').val() && newData.child('type').val() === data.child('type').val() && newData.child('item').val() === data.child('item').val() && newData.child('soort').val() === data.child('soort').val() && newData.child('code').val() === data.child('code').val() && newData.child('aan').val() === data.child('aan').val()))",
            ".validate": "newData.hasChildren(['uid', 'gebruikersnaam']) && (!newData.hasChild('tekst') || (newData.child('tekst').isString() && newData.child('tekst').val().length <= 500)) && (!newData.hasChild('status') || newData.child('status').val() === 'open' || newData.child('status').val() === 'bezig' || newData.child('status').val() === 'geaccepteerd' || newData.child('status').val() === 'geweigerd' || newData.child('status').val() === 'mislukt')"
          }
        }
      }
    }
  }
}
```

Wat de regels doen (kort)
- quizzen, sessies, mysterieboxen, geluksrad, aangepastePoppetjes: open voor iedereen (lezen en schrijven), zoals altijd. quizzen heeft een index op "openbaar".
- gebruikers/<uid>: elke ingelogde gebruiker mag het profiel lezen (nodig voor zoeken en het poppetje bij de naam in de chat). Alleen de eigenaar schrijft, behalve de aantallen onder bezit/dieren/<item> en bezit/accessoires/<item>: die mag elke ingelogde gebruiker aanpassen (getal van 0 of hoger), omdat de ontvanger van een cadeau ook het aantal van de verzender verlaagt.
- gebruikersnamen: ingelogde gebruikers mogen alle namen lezen. Een naam kun je alleen claimen als hij vrij is, en alleen jijzelf kunt hem weer vrijgeven.
- vrienden/<uid>: alleen jijzelf leest je lijst. Jij schrijft in je eigen lijst. Een ander mag alleen jou toevoegen aan zijn lijst als er een vriendschapsverzoek van jou is (dit gebeurt bij accepteren), of een bestaande vriendschap bijwerken (naamswijziging).
- vriendschapsverzoeken/<ontvanger>/<afzender>: de ontvanger leest en verwijdert; de afzender schrijft en leest zijn eigen verzoek (voor "Verzoek gestuurd").
- chats/<chatId>/berichten: alleen de twee deelnemers (hun uid staat in de chatId) lezen en schrijven. Een nieuw bericht moet je eigen uid dragen. Bij een bestaand bericht mag alleen het veld status veranderen. Je mag je eigen bericht verwijderen, behalve tijdens "bezig" (het accepteren van een cadeau of quiz). Tekst maximaal 500 tekens.
- Alles wat niet genoemd wordt is dicht.

Bekende beperkingen (bewust zo gelaten)
- Het versturen van een cadeau (aantallen aanpassen) gebeurt in de browser van de ontvanger; wie de code handmatig aanpast, kan dus vals spelen. Echt afdwingen kan alleen met een server (Cloud Functions).
- Wie in de chat het status-veld van een ander-cadeau zelf op "geaccepteerd" zet, krijgt daar geen poppetje mee; alleen het kaartje verandert.

Wijzigingslogboek
- 2026-09-28: regels volledig in de readme gezet. Vrienden en chat werken nu voor iedereen met een anoniem account (niet alleen sitebeheer). Het profielpoppetje wordt gelezen uit gebruikers/<uid>; die regel bestond al. Nieuwe of aangescherpte regels: chats-validatie (status, tekstlengte), vrienden (toevoegen alleen bij een verzoek), gebruikersnamen (alleen eigen naam vrijgeven).
- 2026-09-28 (app): profielpoppetje voor de naam in de chat, vriendenlijst en verzoeken; duidelijke melding als anoniem aanmelden mislukt; foutmelding bij een chatbericht dat niet verstuurd kan worden. Bestanden: app.js, index.html, style.css.
