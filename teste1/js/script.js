// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuração do Firebase
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

document.addEventListener("DOMContentLoaded", () => {
  // Selecionando elementos do HTML
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const logoutBtn = document.getElementById("logout-btn");
  const csvInput = document.getElementById("csv-input");
  const tableContainer = document.getElementById("table-container");

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login realizado com sucesso!");
      loginForm.style.display = "none";
      logoutBtn.style.display = "block";
      csvInput.style.display = "block";
    } catch (error) {
      alert("Erro no login: " + error.message);
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Logout realizado!");
    loginForm.style.display = "flex";
    logoutBtn.style.display = "none";
    csvInput.style.display = "none";
    tableContainer.innerHTML = "";
  });

  // Upload CSV
  csvInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      gerarTabelaCSV(csv);
    };
    reader.readAsText(file);
  });

  // Função para gerar tabela a partir do CSV
  function gerarTabelaCSV(csv) {
    const linhas = csv.split("\n").map(l => l.trim()).filter(l => l !== "");
    if (linhas.length < 2) return alert("CSV vazio ou inválido.");

    const headers = linhas[0].split(",");
    const rows = linhas.slice(1).map(l => l.split(","));

    let html = "<table><tr>";
    headers.forEach(h => html += `<th>${h}</th>`);
    html += "</tr>";

    rows.forEach(r => {
      html += "<tr>";
      r.forEach((cell, i) => {
        let valor = cell;
        if (headers[i].trim().toUpperCase() === "ATENDIDO NO PAC 2024") {
          valor = (cell.trim().toUpperCase() === "NÃO CONSTA NO PAC 2024") ? "NÃO ATENDIDO" : "ATENDIDO";
        }
        html += `<td>${valor}</td>`;
      });
      html += "</tr>";
    });

    html += "</table>";
    tableContainer.innerHTML = html;
  }
});
