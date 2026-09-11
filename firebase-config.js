// Vervang onderstaande waarden door jouw eigen Firebase-configuratie.
// Je vindt deze in de Firebase Console:
// Project instellingen -> Algemeen -> "Jouw apps" -> Web app -> SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyD9tLFsO8SXHgoqs2_n7wl8FPlcB_w-yz0",
  authDomain: "quizwebsite-f7951.firebaseapp.com",
  databaseURL: "https://console.firebase.google.com/project/quizwebsite-f7951/database/quizwebsite-f7951-default-rtdb/data",
  projectId: "quizwebsite-f7951",
  storageBucket: "quizwebsite-f7951.firebasestorage.app",
  messagingSenderId: "560493888721",
  appId: "1:560493888721:web:2726e9d4a86bbf3df231f0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
