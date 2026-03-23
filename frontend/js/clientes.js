const STORAGE_KEY = "clientes";

function getClientes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveClientes(clientes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function formatTelefone(tel) {
  if (!tel) return "";
  // Simple formatting: keep digits and group
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
}

function renderClientes() {
  const clientes = getClientes();
  const tbody = document.querySelector("#listaClientes tbody");
  tbody.innerHTML = "";

  if (!clientes.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="text-align:center; opacity:0.7;">Nenhum cliente cadastrado ainda.</td>`;
    tbody.appendChild(tr);
    return;
  }

  clientes.forEach((cliente) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${formatTelefone(cliente.telefone)}</td>
      <td>${cliente.email}</td>
      <td>
        <button type="button" class="btn-remover" data-id="${cliente.id}">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function adicionarCliente(event) {
  event.preventDefault();

  const nomeInput = document.getElementById("nome");
  const telefoneInput = document.getElementById("telefone");
  const emailInput = document.getElementById("email");

  const novoCliente = {
    id: Date.now(),
    nome: nomeInput.value.trim(),
    telefone: telefoneInput.value.trim(),
    email: emailInput.value.trim(),
  };

  if (!novoCliente.nome) {
    nomeInput.focus();
    return;
  }

  const clientes = getClientes();
  clientes.push(novoCliente);
  saveClientes(clientes);
  renderClientes();

  document.getElementById("formCliente").reset();
  nomeInput.focus();
}

function handleTableClick(event) {
  if (!event.target.matches("button.btn-remover")) return;
  const id = Number(event.target.dataset.id);
  if (!id) return;

  const clientes = getClientes().filter((c) => c.id !== id);
  saveClientes(clientes);
  renderClientes();
}

function init() {
  document.getElementById("formCliente").addEventListener("submit", adicionarCliente);
  document.querySelector("#listaClientes tbody").addEventListener("click", handleTableClick);
  renderClientes();
}

document.addEventListener("DOMContentLoaded", init);
