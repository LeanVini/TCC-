const ADMIN_LOGIN_KEY = 'agenda_admin_logged';

const isAdminLogged = () => localStorage.getItem(ADMIN_LOGIN_KEY) === 'true';
const getReturnUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('next') || 'agendamentos.html';
};

if (isAdminLogged()) {
    window.location.href = getReturnUrl();
}

const showLoginMessage = (message, type = 'error') => {
    const container = document.getElementById('loginMessage');
    if (!container) return;
    container.textContent = message;
    container.className = `message-box message-${type}`;
    container.style.display = 'block';
};

const saveAdminSession = () => {
    localStorage.setItem(ADMIN_LOGIN_KEY, 'true');
};

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showLoginMessage('Informe usuário e senha.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                showLoginMessage(error.error || 'Falha no login. Tente novamente.', 'error');
                return;
            }

            saveAdminSession();
            window.location.href = getReturnUrl();
        } catch (err) {
            showLoginMessage('Erro ao conectar com o servidor.', 'error');
        }
    });
}
