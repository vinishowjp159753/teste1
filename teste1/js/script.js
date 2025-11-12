// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDHhaUXD8nN2g7RkwVEKRA-sLbziTKZEjE",
  authDomain: "nadespep-e6542.firebaseapp.com",
  projectId: "nadespep-e6542",
  storageBucket: "nadespep-e6542.appspot.com",
  messagingSenderId: "319048705769",
  appId: "1:319048705769:web:4fcd73d77e9778ccb1b278"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos do DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const logoutBtn = document.getElementById('logout-btn');
const csvInput = document.getElementById('csv-input');
const tableContainer = document.getElementById('table-container');

let companyChart, attendedChart;

// Função para mostrar/esconder elementos
function toggleUI(loggedIn) {
  if(loggedIn){
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'block';
    csvInput.style.display = 'block';
  } else {
    loginForm.style.display = 'flex';
    logoutBtn.style.display = 'none';
    csvInput.style.display = 'none';
    tableContainer.innerHTML = '';
    if(companyChart) companyChart.destroy();
    if(attendedChart) attendedChart.destroy();
  }
}

// Verifica estado do usuário
onAuthStateChanged(auth, user => {
  toggleUI(!!user);
});

// LOGIN
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(() => {
      loginForm.reset();
    })
    .catch(err => alert("Erro no login: " + err.message));
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

// FUNÇÃO PARA LER CSV
csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (event) => processCSV(event.target.result);
  reader.readAsText(file);
});

// PROCESSA CSV E GERA TABELA + GRÁFICOS
function processCSV(data){
  const lines = data.split(/\r\n|\n/);
  const headers = lines[0].split(',');
  
  const empresasIdx = headers.indexOf("EMPRESAS");
  const valorIdx = headers.indexOf("VALOR");
  const objetoIdx = headers.indexOf("OBJETO DO CONTRATO");
  const pacIdx = headers.indexOf("ATENDIDO NO PAC 2024");

  if(empresasIdx === -1 || valorIdx === -1 || objetoIdx === -1 || pacIdx === -1){
    alert("Colunas obrigatórias não encontradas no CSV!");
    return;
  }

  const tableData = [];
  const companyTotals = {};
  let attended = 0;
  let notAttended = 0;

  for(let i=1; i<lines.length; i++){
    if(!lines[i].trim()) continue;
    const cols = lines[i].split(',');
    const empresa = cols[empresasIdx].trim();
    const valor = parseFloat(cols[valorIdx].replace(/[^0-9.-]+/g,"")) || 0;
    const objeto = cols[objetoIdx].trim();
    const pac = cols[pacIdx] ? cols[pacIdx].trim().toUpperCase() : '';

    const status = (pac === '' || pac === 'NÃO CONSTA NO PAC 2024') ? 'NÃO ATENDIDO' : 'ATENDIDO';
    if(status === 'ATENDIDO') attended++; else notAttended++;

    if(!companyTotals[empresa]) companyTotals[empresa] = 0;
    companyTotals[empresa] += valor;

    tableData.push({empresa, valor, objeto, pac, status});
  }

  generateTable(tableData);
  generateCharts(companyTotals, attended, notAttended);
}

// FUNÇÃO PARA GERAR TABELA
function generateTable(data){
  let html = '<table><thead><tr>';
  html += '<th>EMPRESA</th><th>VALOR (R$)</th><th>OBJETO DO CONTRATO</th><th>ATENDIDO NO PAC 2024</th><th>STATUS</th>';
  html += '</tr></thead><tbody>';

  data.forEach(row => {
    html += `<tr>
      <td>${row.empresa}</td>
      <td>${row.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
      <td>${row.objeto}</td>
      <td>${row.pac}</td>
      <td>${row.status}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  tableContainer.innerHTML = html;
}

// FUNÇÃO PARA GERAR GRÁFICOS
function generateCharts(companyTotals, attended, notAttended){
  const ctx1 = document.getElementById('companyChart').getContext('2d');
  const ctx2 = document.getElementById('attendedChart').getContext('2d');

  if(companyChart) companyChart.destroy();
  if(attendedChart) attendedChart.destroy();

  companyChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(companyTotals),
      datasets: [{
        label: 'Total por Empresa (R$)',
        data: Object.values(companyTotals),
        backgroundColor: '#003366'
      }]
    },
    options: { responsive:true, plugins: { legend:{ display:false } } }
  });

  attendedChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['ATENDIDO', 'NÃO ATENDIDO'],
      datasets: [{
        data: [attended, notAttended],
        backgroundColor: ['#003366', '#cc0000']
      }]
    },
    options: { responsive:true }
  });
}
