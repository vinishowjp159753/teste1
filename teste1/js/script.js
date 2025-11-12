// =======================
// DADOS DE EXEMPLO
// =======================
let sampleData = [
  { empresa: "ALIMENTOS NORDESTE LTDA", valor: 35200, objeto: "Aquisição de alimentos para cursos presenciais", pac: "SIM" },
  { empresa: "LIDER COMERCIAL", valor: 12500, objeto: "Compra de material de expediente", pac: "NÃO" },
  { empresa: "SABOR BRASIL", valor: 6700, objeto: "Coffee break para palestras", pac: "SIM" },
  { empresa: "TECNO DATA", valor: 48000, objeto: "Serviço de locação de impressoras", pac: "NÃO" },
  { empresa: "PAPEL & CIA", valor: 31500, objeto: "Aquisição de papel A4 e material gráfico", pac: "SIM" }
];

// =======================
// LOGIN
// =======================
document.getElementById("login-form").addEventListener("submit", function(e){
  e.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if(user === "admin" && pass === "1234"){
    document.getElementById("login-page").classList.add("d-none");
    document.getElementById("dashboard").classList.remove("d-none");
    document.getElementById("user-name").textContent = "Admin";
    renderDashboard();
  } else {
    document.getElementById("login-error").classList.remove("d-none");
    setTimeout(()=>document.getElementById("login-error").classList.add("d-none"),3000);
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", ()=>{
  document.getElementById("dashboard").classList.add("d-none");
  document.getElementById("login-page").classList.remove("d-none");
});

// =======================
// RENDERIZAÇÃO PRINCIPAL
// =======================
function renderDashboard(){
  const container = document.getElementById("main-content");
  container.innerHTML = `
    <div class="filter-section d-flex flex-wrap align-items-center justify-content-between">
      <div>
        <label class="me-2 fw-semibold">Filtrar PAC 2024:</label>
        <select id="pacFilter" class="form-select form-select-sm" style="width:auto;display:inline-block;">
          <option value="todos">Todos</option>
          <option value="SIM">Atendidos</option>
          <option value="NÃO">Não atendidos</option>
        </select>
      </div>
      <div>
        <input type="file" id="csv-file-input" accept=".csv" />
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3 col-6">
        <div class="card metric-card"><div class="metric-value" id="totalContratos">0</div><div class="metric-label">Total de Contratos</div></div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card metric-card"><div class="metric-value" id="totalValor">R$ 0,00</div><div class="metric-label">Valor Total</div></div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card metric-card"><div class="metric-value" id="pacAtendidos">0</div><div class="metric-label">Atendidos no PAC</div></div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card metric-card"><div class="metric-value" id="pacNaoAtendidos">0</div><div class="metric-label">Não Atendidos</div></div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-lg-6">
        <div class="card"><div class="card-header">Distribuição por Empresa</div>
          <div class="card-body"><canvas id="chartEmpresas" class="chart-container"></canvas></div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card"><div class="card-header">Atendimentos PAC 2024</div>
          <div class="card-body"><canvas id="chartPAC" class="chart-container"></canvas></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Tabela de Compras</div>
      <div class="card-body table-responsive">
        <table class="table table-striped data-table" id="data-table">
          <thead><tr><th>Empresa</th><th>Valor (R$)</th><th>Objeto</th><th>PAC 2024</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  updateDashboard(sampleData);
  document.getElementById("pacFilter").addEventListener("change", applyFilter);
  document.getElementById("open-import").addEventListener("click", ()=>document.getElementById("csv-file-input").click());
  document.getElementById("csv-file-input").addEventListener("change", handleCSVUpload);
  document.getElementById("export-btn").addEventListener("click", exportCSV);
}

// =======================
// FUNÇÕES PRINCIPAIS
// =======================
function applyFilter(){
  const filter = document.getElementById("pacFilter").value;
  let filtered = sampleData;
  if(filter !== "todos") filtered = sampleData.filter(d=>d.pac === filter);
  updateDashboard(filtered);
}

function updateDashboard(data){
  const totalContratos = data.length;
  const totalValor = data.reduce((sum, d)=>sum+d.valor,0);
  const atendidos = data.filter(d=>d.pac === "SIM").length;
  const naoAtendidos = data.filter(d=>d.pac === "NÃO").length;

  document.getElementById("totalContratos").textContent = totalContratos;
  document.getElementById("totalValor").textContent = "R$ " + totalValor.toLocaleString('pt-BR');
  document.getElementById("pacAtendidos").textContent = atendidos;
  document.getElementById("pacNaoAtendidos").textContent = naoAtendidos;

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = "";
  data.forEach(item=>{
    const tr = document.createElement("tr");
    if(item.pac === "SIM") tr.classList.add("highlight-pac");
    tr.innerHTML = `
      <td>${item.empresa}</td>
      <td>${item.valor.toLocaleString('pt-BR')}</td>
      <td>${item.objeto}</td>
      <td>${item.pac}</td>`;
    tableBody.appendChild(tr);
  });

  renderCharts(data);
}

// =======================
// GRÁFICOS
// =======================
let chartEmpresas, chartPAC;
function renderCharts(data){
  if(chartEmpresas) chartEmpresas.destroy();
  if(chartPAC) chartPAC.destroy();

  const ctx1 = document.getElementById("chartEmpresas");
  const ctx2 = document.getElementById("chartPAC");

  const empresas = [...new Set(data.map(d=>d.empresa))];
  const valores = empresas.map(e=>data.filter(d=>d.empresa===e).reduce((s,d)=>s+d.valor,0));

  chartEmpresas = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: empresas,
      datasets: [{
        label: 'Valor (R$)',
        data: valores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }},
      scales: { y: { beginAtZero: true } }
    }
  });

  const pacCount = [
    data.filter(d=>d.pac==="SIM").length,
    data.filter(d=>d.pac==="NÃO").length
  ];

  chartPAC = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Atendidos','Não Atendidos'],
      datasets: [{
        data: pacCount,
        borderWidth: 2
      }]
    },
    options: { responsive: true, plugins: { legend: { position:'bottom' } } }
  });
}

// =======================
// IMPORTAR CSV
// =======================
function handleCSVUpload(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    const text = e.target.result;
    parseCSV(text);
  };
  reader.readAsText(file);
}

function parseCSV(text){
  const lines = text.trim().split("\n");
  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
  const newData = [];

  const idxEmpresa = headers.findIndex(h => h.includes("empresa"));
  const idxValor = headers.findIndex(h => h.includes("valor"));
  const idxObjeto = headers.findIndex(h => h.includes("objeto"));
  const idxPac = headers.findIndex(h => h.includes("pac"));

  for(let i = 1; i < lines.length; i++){
    const cols = lines[i].split(",");
    if(cols.length < 4) continue;

    const empresa = cols[idxEmpresa]?.trim() || "";
    const valorStr = cols[idxValor]?.trim().replace(/[^\d,]/g,"");
    const valor = parseFloat(valorStr.replace(",", ".")) || 0;
    const objeto = cols[idxObjeto]?.trim() || "";
    const pacText = (cols[idxPac] || "").toUpperCase();

    // AQUI ENTRA SUA REGRA
    const pac = pacText.includes("NÃO CONSTA") ? "NÃO" : "SIM";

    newData.push({ empresa, valor, objeto, pac });
  }

  sampleData = newData;
  updateDashboard(sampleData);
}

// =======================
// EXPORTAR CSV
// =======================
function exportCSV(){
  let csv = "Empresa,Valor,Objeto,PAC 2024\n";
  sampleData.forEach(d=>{
    csv += `${d.empresa},${d.valor},${d.objeto},${d.pac}\n`;
  });

  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dados_espep.csv";
  a.click();
  URL.revokeObjectURL(url);
}
