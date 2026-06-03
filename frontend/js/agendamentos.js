const API_BASE = '/api';
const CLIENT_LOGIN_KEY = 'agenda_client_logged';
const CLIENT_INFO_KEY = 'agenda_client_info';

const isClientLogged = () => localStorage.getItem(CLIENT_LOGIN_KEY) === 'true';
const getClientInfo = () => JSON.parse(localStorage.getItem(CLIENT_INFO_KEY) || 'null');
const saveClientInfo = (client) => localStorage.setItem(CLIENT_INFO_KEY, JSON.stringify(client));

const form = document.getElementById('formAgendamento');
const tabela = document.querySelector('#listaAgendamentos tbody');
const selectTipo = document.getElementById('tipo_massagem');
const messageBox = document.getElementById('messageBox');
const agendamentoId = document.getElementById('agendamento_id');
const cancelEditButton = document.getElementById('cancelEdit');

const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'Data indefinida';
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const showMessage = (text, type = 'info') => {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = 'block';
    if (type !== 'error') {
        setTimeout(() => { messageBox.style.display = 'none'; }, 4500);
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

const requireClientLogin = () => {
    if (!isClientLogged()) {
        const next = encodeURIComponent(window.location.pathname.replace(/.*\//, ''));
        window.location.href = `login.html?next=${next}`;
        return false;
    }
    return true;
};

const prefillClientFields = () => {
    const client = getClientInfo();
    if (!client) return;
    document.getElementById('cliente_nome').value = client.nome || '';
    document.getElementById('cliente_telefone').value = client.telefone || '';
    document.getElementById('cliente_email').value = client.email || '';
};

const renderUserStatus = () => {
    const client = getClientInfo();
    if (!client) return;
    const header = document.querySelector('.page-header .page-header-top');
    if (!header) return;
    const status = document.createElement('div');
    status.className = 'user-status';
    status.innerHTML = `<span>Olá, ${client.nome || 'cliente'}</span> <button id="logoutClient" type="button" class="btn btn-secondary">Sair</button>`;
    header.appendChild(status);
    document.getElementById('logoutClient')?.addEventListener('click', () => {
        localStorage.removeItem(CLIENT_LOGIN_KEY);
        localStorage.removeItem(CLIENT_INFO_KEY);
        window.location.href = 'login.html';
    });
};

const carregarServicos = async () => {
    selectTipo.innerHTML = '<option value="">Carregando serviços...</option>';
    try {
        const res = await fetch('/api/servicos');
        const servicos = await res.json();
        selectTipo.innerHTML = '<option value="">Selecione um tipo de massagem</option>';
        servicos.forEach(servico => {
            const opt = document.createElement('option');
            opt.value = servico.id || servico.nome;
            opt.textContent = servico.nome;
            selectTipo.appendChild(opt);
        });
    } catch (err) {
        selectTipo.innerHTML = '<option value="">Não foi possível carregar serviços</option>';
        console.error('Erro ao carregar serviços:', err);
    }
};

const carregarAgendamentos = async () => {
    tabela.innerHTML = '';
    try {
        const res = await fetch('/api/agendamentos');
        const agendamentos = await res.json();
        const client = getClientInfo();
        const clienteId = client?.id;
        const filtered = agendamentos
            .filter(ag => ag.cliente_id === clienteId)
            .sort((a, b) => {
                if (a.data !== b.data) return a.data.localeCompare(b.data);
                return a.hora.localeCompare(b.hora);
            });

        if (!filtered.length) {
            tabela.innerHTML = '<tr><td colspan="7" style="text-align:center;opacity:.7">Nenhum agendamento encontrado.</td></tr>';
            return;
        }
        filtered.forEach(ag => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ag.data}</td>
                <td>${ag.hora}</td>
                <td>${ag.servico_nome || ag.tipo_massagem || '—'}</td>
                <td>${ag.cliente_nome || '—'}</td>
                <td>${ag.cliente_email || ''}</td>
                <td>${ag.observacoes || ''}</td>
                <td class="action-buttons">
                    <button type="button" class="btn btn-secondary btn-edit" data-id="${ag.id}">Editar</button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        tabela.innerHTML = '<tr><td colspan="7" style="text-align:center;opacity:.7">Erro ao carregar agendamentos.</td></tr>';
        console.error('Erro ao carregar agendamentos:', err);
    }
};

const preencherFormulario = (agendamento) => {
    agendamentoId.value = agendamento.id;
    document.getElementById('data').value = agendamento.data;
    document.getElementById('hora').value = agendamento.hora;
    selectTipo.value = agendamento.servico_id || agendamento.tipo_massagem || '';
    document.getElementById('cliente_nome').value = agendamento.cliente_nome || '';
    document.getElementById('cliente_telefone').value = agendamento.cliente_telefone || '';
    document.getElementById('cliente_email').value = agendamento.cliente_email || '';
    document.getElementById('observacoes').value = agendamento.observacoes || '';
    showMessage('Modo edição ativado. Altere data ou horário e salve.', 'info');
};

if (tabela) {
    tabela.addEventListener('click', async (event) => {
        const editButton = event.target.closest('.btn-edit');
        if (!editButton) return;

        const id = editButton.dataset.id;
        if (!id) return;

        try {
            const res = await fetch(`/api/agendamentos/${id}`);
            if (!res.ok) throw new Error('Não foi possível carregar o agendamento.');
            const agendamento = await res.json();
            preencherFormulario(agendamento);
        } catch (err) {
            console.error('Erro ao carregar agendamento para edição:', err);
            showMessage(err.message, 'error');
        }
    });
}

if (form) {
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const tipoMassagem = selectTipo.value;
        const clienteNome = document.getElementById('cliente_nome').value.trim();
        const clienteTelefone = document.getElementById('cliente_telefone').value.trim();
        const clienteEmail = document.getElementById('cliente_email').value.trim();
        const observacoes = document.getElementById('observacoes').value.trim();

        if (!data || !hora || !tipoMassagem || !clienteNome || !clienteTelefone) {
            showMessage('Preencha data, hora, tipo de massagem, nome e telefone.', 'error');
            return;
        }

        const client = getClientInfo();
        const payload = {
            data,
            hora,
            servico_id: tipoMassagem,
            tipo_massagem: selectTipo.options[selectTipo.selectedIndex]?.text || '',
            cliente_id: client?.id || null,
            cliente_nome: clienteNome,
            cliente_telefone: clienteTelefone,
            cliente_email: clienteEmail,
            observacoes
        };

        const isEdit = agendamentoId.value.trim() !== '';
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/api/agendamentos/${agendamentoId.value}` : '/api/agendamentos';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || 'Erro ao enviar agendamento.');
            }
            const savedAgendamento = await res.json();
            if (client) {
                saveClientInfo({ ...client, nome: clienteNome, telefone: clienteTelefone, email: clienteEmail });
            }
            form.reset();
            agendamentoId.value = '';
            prefillClientFields();
            showMessage(isEdit ? 'Agendamento atualizado com sucesso!' : 'Agendamento enviado com sucesso!', 'success');
            carregarAgendamentos();
        } catch (err) {
            console.error('Erro ao salvar agendamento:', err);
            showMessage(err.message, 'error');
        }
    });
}

if (cancelEditButton) {
    cancelEditButton.addEventListener('click', () => {
        form.reset();
        agendamentoId.value = '';
        prefillClientFields();
        showMessage('Edição cancelada.', 'info');
    });
}

const init = () => {
    if (!requireClientLogin()) return;
    renderUserStatus();
    carregarServicos();
    prefillClientFields();
    carregarAgendamentos();
};

document.addEventListener('DOMContentLoaded', init);
