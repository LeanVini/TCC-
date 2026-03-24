document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formAgendamento');
    const tabela = document.querySelector('#listaAgendamentos tbody');
    const selectTipo = document.getElementById('tipo_massagem');

    let agendamentoEditando = null;

    // Carrega tipos de massagem
    fetch('/api/servicos')
        .then(res => res.json())
        .then(servicos => {
            servicos.forEach(servico => {
                const opt = document.createElement('option');
                opt.value = servico.id;
                opt.textContent = servico.nome;
                selectTipo.appendChild(opt);
            });
        });

    // Carrega agendamentos
    function carregarAgendamentos() {
        tabela.innerHTML = '';
        fetch('/api/agendamentos')
            .then(res => res.json())
            .then(agendamentos => {
                agendamentos.forEach(ag => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${ag.data}</td>
                        <td>${ag.hora}</td>
                        <td>${ag.tipo_massagem}</td>
                        <td>${ag.observacoes || ''}</td>
                        <td class="acoes">
                            <button onclick="editarAgendamento(${ag.id})">Editar</button>
                            <button onclick="excluirAgendamento(${ag.id})">Excluir</button>
                        </td>
                    `;
                    tabela.appendChild(tr);
                });
            });
    }
    carregarAgendamentos();

    // Submete novo agendamento ou edição
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const servico_id = selectTipo.value;
        const observacoes = document.getElementById('observacoes').value;

        const payload = { data, hora, servico_id, observacoes };

        if (agendamentoEditando) {
            fetch(`/api/agendamentos/${agendamentoEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => {
                agendamentoEditando = null;
                form.reset();
                carregarAgendamentos();
            });
        } else {
            fetch('/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => {
                form.reset();
                carregarAgendamentos();
            });
        }
    });

    // Funções globais para editar/excluir
    window.editarAgendamento = function(id) {
        fetch(`/api/agendamentos`)
            .then(res => res.json())
            .then(ags => {
                const ag = ags.find(a => a.id === id);
                if (ag) {
                    document.getElementById('data').value = ag.data;
                    document.getElementById('hora').value = ag.hora;
                    selectTipo.value = getServicoIdByNome(ag.tipo_massagem);
                    document.getElementById('observacoes').value = ag.observacoes || '';
                    agendamentoEditando = ag.id;
                }
            });
    };

    window.excluirAgendamento = function(id) {
        if (confirm('Deseja realmente excluir este agendamento?')) {
            fetch(`/api/agendamentos/${id}`, {
                method: 'DELETE'
            }).then(() => carregarAgendamentos());
        }
    };

    // Helper para pegar o id do serviço pelo nome
    function getServicoIdByNome(nome) {
        for (let i = 0; i < selectTipo.options.length; i++) {
            if (selectTipo.options[i].textContent === nome) {
                return selectTipo.options[i].value;
            }
        }
        return '';
    }
});
