NIEUW: VRIENDEN / CHAT / DUBBELE POPPETJES

Gewijzigde bestanden:
- index.html
- style.css
- app.js

Ongewijzigd:
- poppetjes.js
- firebase-config.js

Nieuw:
- firebase-rules.json

Firebase-instelling:
1. Ga in Firebase Console naar Authentication -> Sign-in method.
2. Zet Anonymous (Anoniem) aan.
3. Open Realtime Database -> Rules en gebruik firebase-rules.json als basis.
4. Publiceer de regels.

Nieuwe functies:
- Gebruikers zoeken op gebruikersnaam.
- Vriendschapsverzoeken sturen en accepteren.
- Chatten met geaccepteerde vrienden.
- Dieren/accessoires kunnen dubbel voorkomen.
- Bij een dubbel item staat een getalletje (bijv. 2).
- Klik op een item in de verzameling om 1 exemplaar te verkopen of te sturen.
- Versturen kan alleen naar geaccepteerde vrienden.

Let op:
De huidige website gebruikte de inventaris oorspronkelijk lokaal. De nieuwe code houdt de aantallen ook bij in Firebase zodat verstuurde items tussen gebruikers kunnen worden uitgewisseld.

BELANGRIJK: publiceer de meegeleverde firebase-rules.json in Realtime Database -> Rules; anders werkt gebruikers zoeken niet.
