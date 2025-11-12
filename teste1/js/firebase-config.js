// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHhaUXD8nN2g7RkwVEKRA-sLbziTKZEjE",
  authDomain: "nadespep-e6542.firebaseapp.com",
  projectId: "nadespep-e6542",
  storageBucket: "nadespep-e6542.firebasestorage.app",
  messagingSenderId: "319048705769",
  appId: "1:319048705769:web:4fcd73d77e9778ccb1b278"
};

// Inicializa o Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
