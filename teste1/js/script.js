// ======== IMPORTAÇÕES FIREBASE ========
import { app, auth, db, storage } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ======== ELEMENTOS DO DOM ========
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const uploadInput = document.getElementById("upload-input");
const tableBody = document.getElementById("data-table-body");
const statusMsg = document.getElementById("status-msg");

// ======== LOGIN ========
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    statusMsg.textContent = "Login realizado com sucesso!";
    statusMsg.style.color = "green";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Falha no login. Verifique o e-mail e a senha.";
    statusMsg.style.color = "red";
  }
});

// ======== VERIFICA SE O USUÁRIO ESTÁ LOGADO ========
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    carregarDadosFirestore();
  } else {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});

// ======== LOGOUT ========
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  statusMsg.textContent = "Você saiu do sistema.";
  statusMsg.style.color = "gray";
});

// ======== LEITURA DO CSV ========
uploadInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const csv = event.target.result;
    const linhas = csv.trim().split("\n").map(l => l.split(","));
    const header = linhas.shift();

    const empresasIndex = header.findIndex(h => h.toUpperCase().includes("EMPRESA"));
    const valorIndex = header.findIndex(h => h.toUpperCase().includes("VALOR"));
    const objetoIndex = header.findIndex(h => h.toUpperCase().includes("OBJETO"));
    const pacIndex = header.findIndex(h => h.toUpperCase().includes("PAC"));

    const registros = linhas.map(linha => {
      const empresa = linha[empresasIndex]?.trim() || "";
      const valor = parseFloat(linha[valorIndex]?.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
      const objeto = linha[objetoIndex]?.trim() || "";
      const pac = linha[pacIndex]?.trim() || "";
      const atendido = pac.toUpperCase().includes("NÃO CONSTA") ? "NÃO ATENDIDO" : "ATENDIDO";
      return { empresa, valor, objeto, pac, atendido };
    });

    await salvarNoFirestore(registros);
    await carregarDadosFirestore();
  };

  reader.readAsText(file);
});

// ======== SALVAR NO FIRESTORE ========
async function salvarNoFirestore(dados) {
  try {
    const ref = collection(db, "compras");
    await addDoc(ref, {
      dataUpload: Timestamp.now(),
      registros: dados
    });
    statusMsg.textContent = "Upload salvo com sucesso!";
    statusMsg.style.color = "green";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Erro ao salvar no banco de dados.";
    statusMsg.style.color = "red";
  }
}

// ======== CARREGAR DADOS DO FIRESTORE ========
async function carregarDadosFirestore() {
  tableBody.innerHTML = "";

  const ref = collection(db, "compras");
  const q = query(ref, orderBy("dataUpload", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    tableBody.innerHTML = "<tr><td colspan='4'>Nenhum dado disponível.</td></tr>";
    return;
  }

  // pega o upload mais recente
  const ultimo = snapshot.docs[0].data().registros;

  let totalAtendidos = 0;
  let totalNaoAtendidos = 0;
  let somaValores = 0;

  ultimo.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.empresa}</td>
      <td>R$ ${item.valor.toFixed(2)}</td>
      <td>${item.objeto}</td>
      <td>${item.atendido}</td>
    `;
    tableBody.appendChild(tr);

    somaValores += item.valor;
    if (item.atendido === "ATENDIDO") totalAtendidos++;
    else totalNaoAtendidos++;
  });

  // Atualiza totais no dashboard (caso tenha elementos para isso)
  const totalGeral = document.getElementById("total-geral");
  const totalAt = document.getElementById("total-atendidos");
  const totalNao = document.getElementById("total-nao");

  if (totalGeral) totalGeral.textContent = `R$ ${somaValores.toFixed(2)}`;
    if (totalAt) totalAt.textContent = totalAtendidos;
  if (totalNao) totalNao.textContent = totalNaoAtendidos;
}

// ======== EXPORTAR PARA EXCEL ========
document.getElementById("export-btn")?.addEventListener("click", () => {
  const rows = [["EMPRESA", "VALOR", "OBJETO", "ATENDIDO"]];
  document.querySelectorAll("#data-table-body tr").forEach((tr) => {
    const cells = Array.from(tr.children).map((td) => td.innerText);
    rows.push(cells);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "dados_compras.csv";
  link.click();
});
