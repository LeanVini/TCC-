const ADMIN_LOGIN_KEY = 'agenda_admin_logged';
const CLIENT_LOGIN_KEY = 'agenda_client_logged';
const CLIENT_INFO_KEY = 'agenda_client_info';
const API_BASE = window.location.protocol.startsWith('http') ? '' : 'http://localhost:8080';

const getReturnUrl = (defaultRoute) => {
    const params = new URLSearchParams(window.location.search);
    return params.get('next') || defaultRoute;
};

const isAdminLogged = () => localStorage.getItem(ADMIN_LOGIN_KEY) === 'true';
const isClientLogged = () => localStorage.getItem(CLIENT_LOGIN_KEY) === 'true';

const saveAdminSession = () => {
    localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
};

const saveClientSession = (client) => {
    localStorage.setItem(CLIENT_LOGIN_KEY, 'true');
    localStorage.setItem(CLIENT_INFO_KEY, JSON.stringify(client));
};

const showLoginMessage = (message, type = 'error') => {
    const container = document.getElementById('loginMessage');
    if (!container) return;
    container.textContent = message;
    container.className = `message-box message-${type}`;
    container.style.display = 'block';
};

const handleAdminLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showLoginMessage('Informe usuário e senha.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            showLoginMessage(error.error || 'Falha no login administrativo.', 'error');
            return;
        }

        saveAdminSession();
        window.location.href = getReturnUrl('admin.html');
    } catch (err) {
        showLoginMessage('Erro ao conectar com o servidor.', 'error');
    }
};

const handleClientLogin = async (event) => {
    event.preventDefault();
    const nome = document.getElementById('client_nome').value.trim();
    const email = document.getElementById('client_email').value.trim();
    const telefone = document.getElementById('client_telefone').value.trim();

    if (!email || !telefone) {
        showLoginMessage('Preencha email e telefone para continuar.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/clientes/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            showLoginMessage(error.error || 'Falha no login do cliente.', 'error');
            return;
        }

        const cliente = await response.json();
        saveClientSession(cliente);
        window.location.href = getReturnUrl('index.html');
    } catch (err) {
        showLoginMessage('Erro ao conectar com o servidor.', 'error');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    if (isAdminLogged()) {
        window.location.href = getReturnUrl('admin.html');
        return;
    }

    if (isClientLogged()) {
        window.location.href = getReturnUrl('index.html');
        return;
    }

    const adminForm = document.getElementById('adminLoginForm');
    const clientForm = document.getElementById('clientLoginForm');
    if (adminForm) adminForm.addEventListener('submit', handleAdminLogin);
    if (clientForm) clientForm.addEventListener('submit', handleClientLogin);
});
