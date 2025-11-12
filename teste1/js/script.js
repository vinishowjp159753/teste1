// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDHhaUXD8nN2g7RkwVEKRA-sLbziTKZEjE",
  authDomain: "nadespep-e6542.firebaseapp.com",
  projectId: "nadespep-e6542",
  storageBucket: "nadespep-e6542.firebasestorage.app",
  messagingSenderId: "319048705769",
  appId: "1:319048705769:web:4fcd73d77e9778ccb1b278"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ELEMENTOS HTML ---
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const csvInput = document.getElementById('csv-input');
const tableContainer = document.getElementById('table-container');

// --- LOGIN ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Login efetuado com sucesso!');
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'block';
    csvInput.style.display = 'block';
  } catch (err) {
    alert('Erro no login: ' + err.message);
  }
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  alert('Logout efetuado!');
  loginForm.style.display = 'block';
  logoutBtn.style.display = 'none';
  csvInput.style.display = 'none';
  tableContainer.innerHTML = '';
});

// --- PROCESSAR CSV ---
csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    const rows = text.split('\n').map(r => r.split(','));
    generateTable(rows);
  };
  reader.readAsText(file);
});

// --- GERAR TABELA ---
function generateTable(data) {
  if (!data.length) return;

  const headers = data[0];
  const rows = data.slice(1);

  let html = '<table border="1" style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr>';
  headers.forEach(h => html += `<th>${h.trim()}</th>`);
  html += '</tr></thead><tbody>';

  rows.forEach(r => {
    if (r.length !== headers.length) return; // ignora linhas incompletas
    html += '<tr>';
    r.forEach((cell, i) => {
      // regra PAC 2024
      if (headers[i].trim().toUpperCase() === 'ATENDIDO NO PAC 2024') {
        const val = cell.trim().toUpperCase();
        html += `<td>${val === 'NÃO CONSTA NO PAC 2024' ? 'NÃO ATENDIDO' : 'ATENDIDO'}</td>`;
      } else {
        html += `<td>${cell.trim()}</td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}
