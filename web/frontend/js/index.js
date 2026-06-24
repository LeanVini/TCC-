const CLIENT_LOGIN_KEY = 'agenda_client_logged';
const CLIENT_INFO_KEY = 'agenda_client_info';

const requireClientLogin = () => {
    if (localStorage.getItem(CLIENT_LOGIN_KEY) !== 'true') {
        const next = encodeURIComponent(window.location.pathname.replace(/.*\//, ''));
        window.location.href = `login.html?next=${next}`;
        return;
    }

    const client = JSON.parse(localStorage.getItem(CLIENT_INFO_KEY) || 'null');
    if (client && client.nome) {
        const header = document.querySelector('header .header-inner');
        if (header) {
            const status = document.createElement('div');
            status.className = 'user-status';
            status.innerHTML = `<span>Olá, ${client.nome}</span> <button id="logoutClient" class="btn btn-secondary">Sair</button>`;
            header.appendChild(status);
            document.getElementById('logoutClient')?.addEventListener('click', () => {
                localStorage.removeItem(CLIENT_LOGIN_KEY);
                localStorage.removeItem(CLIENT_INFO_KEY);
                window.location.href = 'login.html';
            });
        }
    }
};

window.addEventListener('DOMContentLoaded', requireClientLogin);
