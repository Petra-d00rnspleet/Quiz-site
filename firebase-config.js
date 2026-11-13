// Vervang onderstaande waarden door jouw eigen Firebase-configuratie.
// Je vindt deze in de Firebase Console:
// Project instellingen -> Algemeen -> "Jouw apps" -> Web app -> SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyD9tLFsO8SXHgoqs2_n7wl8FPlcB_w-yz0",
  authDomain: "quizwebsite-f7951.firebaseapp.com",
  databaseURL: "https://quizwebsit// Firebase-configuratie
//
// LET OP over databaseURL:
// De waarde die je had ingevuld ("https://console.firebase.google.com/project/...")
// is de link naar de Firebase Console-website, niet de echte database-URL.
// Daardoor kon Firebase niet worden gestart en deed de "Opslaan"-knop niets.
//
// Zo vind je de juiste databaseURL:
// 1. Ga naar Firebase Console -> Build -> Realtime Database -> tab "Data".
// 2. Bovenaan die pagina staat een URL die begint met "https://" en eindigt op
//    ".firebaseio.com" of ".firebasedatabase.app" (bijv.
//    https://quizwebsite-f7951-default-rtdb.europe-west1.firebasedatabase.app).
// 3. Plak die complete URL hieronder bij databaseURL (met een "/" aan het eind).

const firebaseConfig = {
  apiKey: "AIzaSyD9tLFsO8SXHgoqs2_n7wl8FPlcB_w-yz0",
  authDomain: "quizwebsite-f7951.firebaseapp.com",
  databaseURL: "VERVANG_DIT_MET_JE_ECHTE_DATABASE_URL",
  projectId: "quizwebsite-f7951",
  storageBucket: "quizwebsite-f7951.firebasestorage.app",
  messagingSenderId: "560493888721",
  appId: "1:560493888721:web:2726e9d4a86bbf3df231f0"
};

let db;

function toonFirebaseFout(bericht) {
  const balk = document.getElementById('firebase-fout-balk');
  if (balk) {
    balk.textContent = '⚠️ Firebase-configuratie klopt niet: ' + bericht + ' — controleer databaseURL in firebase-config.js.';
    balk.style.display = 'block';
  }
}

try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
} catch (fout) {
  document.addEventListener('DOMContentLoaded', () => toonFirebaseFout(fout.message));
}e-f7951-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "quizwebsite-f7951",
  storageBucket: "quizwebsite-f7951.firebasestorage.app",
  messagingSenderId: "560493888721",
  appId: "1:560493888721:web:2726e9d4a86bbf3df231f0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
