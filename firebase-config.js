// Vervang onderstaande waarden door jouw eigen Firebase-configuratie.
// Je vindt deze in de Firebase Console:
// Project instellingen -> Algemeen -> "Jouw apps" -> Web app -> SDK setup and configuration

const firebaseConfig = {
  apiKey: "VUL_HIER_IN",
  authDomain: "VUL_HIER_IN.firebaseapp.com",
  databaseURL: "https://VUL_HIER_IN-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "VUL_HIER_IN",
  storageBucket: "VUL_HIER_IN.appspot.com",
  messagingSenderId: "VUL_HIER_IN",
  appId: "VUL_HIER_IN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
