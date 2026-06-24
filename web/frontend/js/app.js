const API_BASE = '/api';
const ADMIN_LOGIN_KEY = 'agenda_admin_logged';
const REFRESH_INTERVAL_MS = 15000;
const isAdminLogged = () => localStorage.getItem(ADMIN_LOGIN_KEY) === 'true';
const requireAdminLogin = () => {
    if (!isAdminLogged()) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.href = `login.html?next=${next}`;
    }
};
window.logoutAdmin = () => {
    localStorage.removeItem(ADMIN_LOGIN_KEY);
    window.location.href = 'login.html';
};

if (window.location.pathname.endsWith('admin.html')) {
    requireAdminLogin();
}

const agendaBody = document.querySelector('#listaAgendamentos tbody');
const searchInput = document.getElementById('searchInput');
const todayPanel = document.getElementById('todayList');
const todayStatus = document.getElementById('todayRefreshStatus');
let agendamentosCache = [];
let refreshTimer = null;
let isRefreshing = false;

const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'Data indefinida';
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getTodayDateKey = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

const updateRefreshStatus = (loading = false) => {
    if (!todayStatus) return;
    if (loading) {
        todayStatus.textContent = 'Atualizando...';
        return;
    }
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    todayStatus.textContent = `Última atualização: ${time}`;
};

const renderTodaySummary = () => {
    if (!todayPanel) return;
    const todayKey = getTodayDateKey();
    const todayItems = agendamentosCache
        .filter(item => item.data === todayKey)
        .sort((a, b) => a.hora.localeCompare(b.hora));

    if (!todayItems.length) {
        todayPanel.innerHTML = '<p class="today-empty">Nenhum agendamento para hoje.</p>';
        return;
    }

    todayPanel.innerHTML = todayItems.map(item => `
        <article class="today-item">
            <div class="today-time">${item.hora}</div>
            <div class="today-info">
                <strong>${item.servico_nome || item.tipo_massagem || '—'}</strong>
                <p>${item.cliente_nome || '—'} <small>${item.cliente_email || ''}</small></p>
            </div>
        </article>
    `).join('');
};

const showMessage = (text, type = 'info') => {
    const container = document.getElementById('messageBox');
    if (!container) return;
    container.textContent = text;
    container.className = `message-box message-${type}`;
    container.style.display = 'block';
    if (type !== 'error') {
        setTimeout(() => { container.style.display = 'none'; }, 4500);
    }
};

const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Erro ${response.status}`);
    }
    return response.json();
};

const loadAgendamentos = async () => {
    if (isRefreshing) return;
    isRefreshing = true;
    updateRefreshStatus(true);

    try {
        agendamentosCache = await apiCall('/agendamentos');
    } catch (err) {
        agendamentosCache = [];
        showMessage('Não foi possível carregar agendamentos.', 'error');
    } finally {
        renderAgendamentos();
        renderTodaySummary();
        updateRefreshStatus(false);
        isRefreshing = false;
    }
};

const startAutoRefresh = () => {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(async () => {
        if (isRefreshing) return;
        await loadAgendamentos();
    }, REFRESH_INTERVAL_MS);
};

const renderAgendamentos = () => {
    if (!agendaBody) return;

    const filter = searchInput?.value.trim().toLowerCase() || '';
    const filtered = agendamentosCache
        .filter(item => {
            const content = [item.cliente_nome, item.cliente_email, item.tipo_massagem, item.servico_nome, item.data, item.hora]
                .filter(Boolean)
                .join(' ').toLowerCase();
            return content.includes(filter);
        })
        .sort((a, b) => {
            if (a.data !== b.data) return a.data.localeCompare(b.data);
            return a.hora.localeCompare(b.hora);
        });

    agendaBody.innerHTML = '';
    if (!filtered.length) {
        agendaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;opacity:.7">Nenhum agendamento encontrado.</td></tr>';
        return;
    }

    let currentDate = null;
    filtered.forEach(item => {
        if (item.data !== currentDate) {
            currentDate = item.data;
            const headingRow = document.createElement('tr');
            headingRow.className = 'date-group-row';
            headingRow.innerHTML = `<td colspan="7">${formatDateLabel(item.data)}</td>`;
            agendaBody.appendChild(headingRow);
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.data}</td>
            <td>${item.hora}</td>
            <td>${item.servico_nome || item.tipo_massagem || '—'}</td>
            <td>${item.cliente_nome || '—'}</td>
            <td>${item.cliente_email || ''}</td>
            <td>${item.observacoes || ''}</td>
            <td class="acoes">
                <button class="btn-remove-agendamento" data-id="${item.id}">Excluir</button>
            </td>
        `;
        agendaBody.appendChild(tr);
    });
};

const removeAgendamento = async (id) => {
    if (!confirm('Excluir este agendamento?')) return;
    try {
        await apiCall(`/agendamentos/${id}`, { method: 'DELETE' });
        await loadAgendamentos();
        showMessage('Agendamento excluído.');
    } catch (err) {
        showMessage(err.message, 'error');
    }
};

const setupEvents = () => {
    if (searchInput) {
        searchInput.addEventListener('input', debounce(renderAgendamentos, 300));
    }

    const agendaTbody = document.querySelector('#listaAgendamentos tbody');
    if (agendaTbody) {
        agendaTbody.addEventListener('click', (event) => {
            const target = event.target;
            const id = target.dataset.id;
            if (!id) return;
            if (target.classList.contains('btn-remove-agendamento')) removeAgendamento(id);
        });
    }
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

window.addEventListener('DOMContentLoaded', async () => {
    setupEvents();
    await loadAgendamentos();
    startAutoRefresh();
});
