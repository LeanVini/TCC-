document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formAgendamento');
    const tabela = document.querySelector('#listaAgendamentos tbody');
    const selectTipo = document.getElementById('tipo_massagem');
    const messageBox = document.getElementById('messageBox');

    const formatTelefone = (tel) => {
        if (!tel) return '';
        const digits = tel.replace(/\D/g, '');
        if (digits.length >= 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (digits.length >= 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        return tel;
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
            if (!agendamentos.length) {
                tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;opacity:.7">Nenhum agendamento encontrado.</td></tr>';
                return;
            }
            agendamentos.sort((a, b) => {
                if (a.data !== b.data) return a.data.localeCompare(b.data);
                return a.hora.localeCompare(b.hora);
            });
            agendamentos.forEach(ag => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${ag.data}</td>
                    <td>${ag.hora}</td>
                    <td>${ag.servico_nome || ag.tipo_massagem || '—'}</td>
                    <td>${ag.cliente_nome || '—'}</td>
                    <td>${ag.cliente_email || ''}</td>
                    <td>${ag.observacoes || ''}</td>
                `;
                tabela.appendChild(tr);
            });
        } catch (err) {
            tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;opacity:.7">Erro ao carregar agendamentos.</td></tr>';
            console.error('Erro ao carregar agendamentos:', err);
        }
    };

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

        const payload = {
            data,
            hora,
            servico_id: tipoMassagem,
            tipo_massagem: selectTipo.options[selectTipo.selectedIndex]?.text || '',
            cliente_nome: clienteNome,
            cliente_telefone: clienteTelefone,
            cliente_email: clienteEmail,
            observacoes
        };

        try {
            const res = await fetch('/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error || 'Erro ao enviar agendamento.');
            }
            form.reset();
            showMessage('Agendamento enviado com sucesso!', 'info');
            carregarAgendamentos();
        } catch (err) {
            console.error('Erro ao salvar agendamento:', err);
            showMessage(err.message, 'error');
        }
    });

    carregarServicos();
    carregarAgendamentos();
});
