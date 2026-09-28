BELANGRIJK VOOR DE VRIENDENFUNCTIE EN DE CHAT

1. Gebruik de bestanden uit deze ZIP.
2. Zet in Firebase Authentication > Sign-in method > Anonymous / Anoniem aan.
3. Zet in Firebase Realtime Database > Rules de VOLLEDIGE inhoud van firebase-rules.json en klik op Publiceren.
4. Herlaad de website daarna.


WAT IS ER NIEUW IN DE CHAT
- De chat met een vriend is nu beeldvullend (het hele scherm).
- Met de knop 🎨 bovenin kies je een achtergrond (13 keuzes) en een tekstkleur (8 kleuren + eigen kleur).
  Dit wordt per chat onthouden in je eigen browser. Je vriend ziet jouw achtergrond niet.
- Naast het schrijfvak staat een knopje met je poppetje en een plusje. Klik erop, kies een dier of accessoire
  uit je eigen verzameling en klik op "Verzenden". Het poppetje staat dan als cadeaukaart in de chat.
- De ander kan het Accepteren of Weigeren. Pas bij accepteren heeft de verzender er een minder en de ontvanger er een erbij.
  De verzender kan het cadeau terugtrekken zolang het nog niet is geaccepteerd.
- Je kunt niet meer aanbieden dan je hebt, en je laatste dier of accessoire kun je niet versturen.
- Een chatbericht met een poppetje heeft in Firebase: type "poppetje", soort ("dier" of "accessoire"), item, aan (uid ontvanger)
  en status ("open", "bezig", "geaccepteerd", "geweigerd" of "mislukt").


GEBRUIKERSNAAM WIJZIGEN EN VRIENDEN ZOEKEN
- Klik rechtsboven op je poppetje > "Gebruikersnaam wijzigen". Is de nieuwe naam nog vrij, dan wordt hij meteen je naam.
  Je oude naam komt weer vrij voor anderen. De nieuwe naam verschijnt ook in de vriendenlijst van je vrienden en bij je eigen quizzen.
  Twee mensen kunnen nooit dezelfde naam hebben (hoofdletters maken geen verschil).
- Vrienden zoeken werkt nu zoals quizzen zoeken: je ziet de resultaten terwijl je typt, hoofdletters maken niet uit
  en je hoeft niet het begin van de naam te typen (een stukje van de naam is genoeg).
- Heeft iemand jou al een verzoek gestuurd, dan staat er bij die persoon "Accepteren". Heb je zelf al een verzoek gestuurd, dan staat er "Verzoek gestuurd".


WAAROM DE REGELS ZIJN AANGEPAST
- Vriendschapsverzoeken: de ontvanger moet het verzoek kunnen verwijderen zodra het wordt geaccepteerd.
  De vorige regel liet alleen de afzender schrijven naar het verzoek, waardoor accepteren kon mislukken.
- Chats: alleen de twee deelnemers kunnen berichten lezen en schrijven. Bij een bestaand bericht mag alleen het veld "status" veranderen
  (dat is nodig om een poppetje te accepteren of te weigeren).
- Poppetjes versturen: bij accepteren schrijft de ontvanger ook naar het aantal poppetjes van de verzender (gebruikers/<uid>/bezit),
  daarom mag elke ingelogde gebruiker naar losse items onder bezit/dieren en bezit/accessoires schrijven (alleen getallen van 0 of hoger).
- Gebruikersnaam wijzigen: je mag je eigen naam vrijgeven (verwijderen) uit "gebruikersnamen", en je mag je eigen naam
  bijwerken in de vriendenlijst van je vrienden. De afzender van een vriendschapsverzoek mag dat verzoek ook lezen (voor "Verzoek gestuurd").
- gebruikers, gebruikersnamen, vrienden en vriendschapsverzoeken staan ook in firebase-rules.json.
  Zonder die regels kan het zoeken en toevoegen van vrienden niet werken.


KISTEN HERSTELD
De meegeleverde firebase-rules.json bevat ook weer de oorspronkelijke regels voor quizzen, sessies, mysterieboxen,
geluksrad en aangepastePoppetjes. Publiceer deze volledige regels in Firebase.
