// ==================== CAMADA DE DADOS ====================
class DataService {
    constructor() {
        this.storageKeys = {
            pacientes: 'clinica_pacientes',
            medicos: 'clinica_medicos',
            consultas: 'clinica_consultas'
        };
        this.initData();
    }

    initData() {
        if (!localStorage.getItem(this.storageKeys.pacientes)) {
            localStorage.setItem(this.storageKeys.pacientes, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.medicos)) {
            localStorage.setItem(this.storageKeys.medicos, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.consultas)) {
            localStorage.setItem(this.storageKeys.consultas, JSON.stringify([]));
        }
    }

    getPacientes() {
        return JSON.parse(localStorage.getItem(this.storageKeys.pacientes));
    }

    savePacientes(pacientes) {
        localStorage.setItem(this.storageKeys.pacientes, JSON.stringify(pacientes));
    }

    getMedicos() {
        return JSON.parse(localStorage.getItem(this.storageKeys.medicos));
    }

    saveMedicos(medicos) {
        localStorage.setItem(this.storageKeys.medicos, JSON.stringify(medicos));
    }

    getConsultas() {
        return JSON.parse(localStorage.getItem(this.storageKeys.consultas));
    }

    saveConsultas(consultas) {
        localStorage.setItem(this.storageKeys.consultas, JSON.stringify(consultas));
    }
}

// ==================== CAMADA DE NEGÓCIO ====================
class Validador {
    static validarCPF(cpf, pacientes, idIgnorar = null) {
        const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
        if (!cpfRegex.test(cpf)) {
            return { valido: false, mensagem: 'CPF inválido. Use formato 000.000.000-00' };
        }
        
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        const existe = pacientes.some(p => p.cpf === cpfLimpo && p.id !== idIgnorar);
        if (existe) {
            return { valido: false, mensagem: 'CPF já cadastrado' };
        }
        
        return { valido: true };
    }

    static validarDataConsulta(dataHora, consultas, medicoId, idIgnorar = null) {
        const data = new Date(dataHora);
        const agora = new Date();
        
        if (data < agora) {
            return { valido: false, mensagem: 'Data/Hora não pode ser no passado' };
        }
        
        const conflito = consultas.some(c => 
            c.medicoId == medicoId && 
            c.dataHora === dataHora && 
            c.id !== idIgnorar &&
            c.status !== 'CANCELADA'
        );
        
        if (conflito) {
            return { valido: false, mensagem: 'Médico já possui consulta neste horário' };
        }
        
        return { valido: true };
    }

    static validarPaciente(paciente) {
        if (!paciente.nome || paciente.nome.trim() === '') {
            return { valido: false, mensagem: 'Nome é obrigatório' };
        }
        if (!paciente.cpf || paciente.cpf.trim() === '') {
            return { valido: false, mensagem: 'CPF é obrigatório' };
        }
        return { valido: true };
    }

    static validarMedico(medico) {
        if (!medico.nome || medico.nome.trim() === '') {
            return { valido: false, mensagem: 'Nome é obrigatório' };
        }
        if (!medico.especialidade || medico.especialidade.trim() === '') {
            return { valido: false, mensagem: 'Especialidade é obrigatória' };
        }
        return { valido: true };
    }
}

// ==================== CAMADA DE CONTROLE ====================
const dataService = new DataService();
let pacientes = [];
let medicos = [];
let consultas = [];

function carregarDados() {
    pacientes = dataService.getPacientes();
    medicos = dataService.getMedicos();
    consultas = dataService.getConsultas();
}

function salvarPacientes() {
    dataService.savePacientes(pacientes);
}

function salvarMedicos() {
    dataService.saveMedicos(medicos);
}

function salvarConsultas() {
    dataService.saveConsultas(consultas);
}

// ==================== CRUD PACIENTES ====================
function listarPacientes() {
    const tbody = document.getElementById('listaPacientes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    pacientes.forEach(p => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = p.id;
        row.insertCell(1).textContent = p.nome;
        row.insertCell(2).textContent = p.cpf;
        row.insertCell(3).textContent = p.telefone || '-';
        row.insertCell(4).textContent = p.dataNasc || '-';
        
        const acoes = row.insertCell(5);
        acoes.innerHTML = `
            <button class="btn-warning" onclick="editarPaciente(${p.id})">✏️</button>
            <button class="btn-danger" onclick="excluirPaciente(${p.id})">🗑️</button>
        `;
    });
}

function adicionarPaciente(paciente) {
    const validacao = Validador.validarPaciente(paciente);
    if (!validacao.valido) {
        alert(validacao.mensagem);
        return false;
    }
    
    const validacaoCPF = Validador.validarCPF(paciente.cpf, pacientes);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return false;
    }
    
    paciente.id = Date.now();
    pacientes.push(paciente);
    salvarPacientes();
    listarPacientes();
    atualizarDashboard();
    atualizarSelects();
    return true;
}

function editarPaciente(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (paciente) {
        abrirModalPaciente(paciente);
    }
}

function excluirPaciente(id) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        const temConsultas = consultas.some(c => c.pacienteId == id && c.status !== 'CANCELADA');
        if (temConsultas) {
            alert('Não é possível excluir paciente com consultas agendadas');
            return;
        }
        pacientes = pacientes.filter(p => p.id !== id);
        salvarPacientes();
        listarPacientes();
        atualizarDashboard();
        atualizarSelects();
    }
}

function salvarPaciente() {
    const nome = document.getElementById('modalPacienteNome').value;
    const cpf = document.getElementById('modalPacienteCpf').value;
    const telefone = document.getElementById('modalPacienteTelefone').value;
    const dataNasc = document.getElementById('modalPacienteDataNasc').value;
    
    const paciente = { nome, cpf, telefone, dataNasc };
    
    if (adicionarPaciente(paciente)) {
        fecharModal('modalPaciente');
        limparModalPaciente();
    }
}

// ==================== CRUD MÉDICOS ====================
function listarMedicos() {
    const tbody = document.getElementById('listaMedicos');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    medicos.forEach(m => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = m.id;
        row.insertCell(1).textContent = m.nome;
        row.insertCell(2).textContent = m.especialidade;
        row.insertCell(3).textContent = m.crm || '-';
        
        const acoes = row.insertCell(4);
        acoes.innerHTML = `
            <button class="btn-warning" onclick="editarMedico(${m.id})">✏️</button>
            <button class="btn-danger" onclick="excluirMedico(${m.id})">🗑️</button>
        `;
    });
}

function adicionarMedico(medico) {
    const validacao = Validador.validarMedico(medico);
    if (!validacao.valido) {
        alert(validacao.mensagem);
        return false;
    }
    
    medico.id = Date.now();
    medicos.push(medico);
    salvarMedicos();
    listarMedicos();
    atualizarDashboard();
    atualizarSelects();
    return true;
}

function excluirMedico(id) {
    if (confirm('Tem certeza que deseja excluir este médico?')) {
        const temConsultas = consultas.some(c => c.medicoId == id && c.status !== 'CANCELADA');
        if (temConsultas) {
            alert('Não é possível excluir médico com consultas agendadas');
            return;
        }
        medicos = medicos.filter(m => m.id !== id);
        salvarMedicos();
        listarMedicos();
        atualizarDashboard();
        atualizarSelects();
    }
}

function salvarMedico() {
    const nome = document.getElementById('modalMedicoNome').value;
    const especialidade = document.getElementById('modalMedicoEspecialidade').value;
    const crm = document.getElementById('modalMedicoCrm').value;
    
    const medico = { nome, especialidade, crm };
    
    if (adicionarMedico(medico)) {
        fecharModal('modalMedico');
        limparModalMedico();
    }
}

// ==================== CRUD CONSULTAS ====================
function listarConsultas() {
    const tbody = document.getElementById('listaConsultas');
    const filtroStatus = document.getElementById('filtroStatus')?.value || 'todos';
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let consultasFiltradas = consultas;
    
    if (filtroStatus !== 'todos') {
        consultasFiltradas = consultas.filter(c => c.status === filtroStatus);
    }
    
    consultasFiltradas.forEach(c => {
        const paciente = pacientes.find(p => p.id == c.pacienteId);
        const medico = medicos.find(m => m.id == c.medicoId);
        
        if (!paciente || !medico) return;
        
        const row = tbody.insertRow();
        row.insertCell(0).textContent = c.id;
        row.insertCell(1).textContent = paciente.nome;
        row.insertCell(2).textContent = medico.nome;
        row.insertCell(3).textContent = new Date(c.dataHora).toLocaleString();
        
        const statusCell = row.insertCell(4);
        const statusClass = getStatusClass(c.status);
        statusCell.innerHTML = `<span class="status-badge ${statusClass}">${c.status}</span>`;
        
        const acoes = row.insertCell(5);
        let botoes = '';
        
        if (c.status === 'AGENDADA') {
            botoes += `<button class="btn-success" onclick="confirmarConsulta(${c.id})">✅</button>`;
        }
        if (c.status === 'AGENDADA' || c.status === 'CONFIRMADA') {
            botoes += `<button class="btn-success" onclick="realizarConsulta(${c.id})">✓</button>`;
        }
        if (c.status !== 'CANCELADA' && c.status !== 'REALIZADA') {
            botoes += `<button class="btn-danger" onclick="cancelarConsulta(${c.id})">✗</button>`;
        }
        
        acoes.innerHTML = botoes;
    });
}

function getStatusClass(status) {
    const classes = {
        'AGENDADA': 'status-agendada',
        'CONFIRMADA': 'status-confirmada',
        'REALIZADA': 'status-realizada',
        'CANCELADA': 'status-cancelada'
    };
    return classes[status] || '';
}

function adicionarConsulta(consulta) {
    const validacao = Validador.validarDataConsulta(consulta.dataHora, consultas, consulta.medicoId);
    if (!validacao.valido) {
        alert(validacao.mensagem);
        return false;
    }
    
    consulta.id = Date.now();
    consulta.status = 'AGENDADA';
    consultas.push(consulta);
    salvarConsultas();
    listarConsultas();
    atualizarDashboard();
    return true;
}

function confirmarConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (consulta) {
        consulta.status = 'CONFIRMADA';
        salvarConsultas();
        listarConsultas();
        atualizarDashboard();
    }
}

function realizarConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (consulta) {
        consulta.status = 'REALIZADA';
        salvarConsultas();
        listarConsultas();
        atualizarDashboard();
    }
}

function cancelarConsulta(id) {
    if (confirm('Cancelar esta consulta?')) {
        const consulta = consultas.find(c => c.id === id);
        if (consulta) {
            consulta.status = 'CANCELADA';
            salvarConsultas();
            listarConsultas();
            atualizarDashboard();
        }
    }
}

function salvarConsulta() {
    const pacienteId = parseInt(document.getElementById('modalConsultaPaciente').value);
    const medicoId = parseInt(document.getElementById('modalConsultaMedico').value);
    const dataHora = document.getElementById('modalConsultaData').value;
    
    if (!pacienteId || !medicoId || !dataHora) {
        alert('Preencha todos os campos');
        return;
    }
    
    const consulta = { pacienteId, medicoId, dataHora };
    
    if (adicionarConsulta(consulta)) {
        fecharModal('modalConsulta');
        limparModalConsulta();
    }
}

// ==================== DASHBOARD ====================
function atualizarDashboard() {
    const totalPacientes = document.getElementById('totalPacientes');
    const totalMedicos = document.getElementById('totalMedicos');
    const totalConsultas = document.getElementById('totalConsultas');
    const proximasConsultas = document.getElementById('proximasConsultas');
    
    if (totalPacientes) totalPacientes.textContent = pacientes.length;
    if (totalMedicos) totalMedicos.textContent = medicos.length;
    if (totalConsultas) totalConsultas.textContent = consultas.filter(c => c.status !== 'CANCELADA').length;
    
    if (proximasConsultas) {
        const agora = new Date();
        const proximas = consultas
            .filter(c => c.status !== 'CANCELADA' && new Date(c.dataHora) > agora)
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
            .slice(0, 5);
        
        proximasConsultas.innerHTML = '';
        if (proximas.length === 0) {
            proximasConsultas.innerHTML = '<li>Nenhuma consulta agendada</li>';
        } else {
            proximas.forEach(c => {
                const paciente = pacientes.find(p => p.id == c.pacienteId);
                const medico = medicos.find(m => m.id == c.medicoId);
                const li = document.createElement('li');
                li.textContent = `${paciente?.nome} com ${medico?.nome} - ${new Date(c.dataHora).toLocaleString()} (${c.status})`;
                proximasConsultas.appendChild(li);
            });
        }
    }
}

// ==================== AUXILIARES ====================
function atualizarSelects() {
    const selPaciente = document.getElementById('modalConsultaPaciente');
    const selMedico = document.getElementById('modalConsultaMedico');
    
    if (selPaciente) {
        selPaciente.innerHTML = '<option value="">Selecione um paciente</option>';
        pacientes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nome;
            selPaciente.appendChild(opt);
        });
    }
    
    if (selMedico) {
        selMedico.innerHTML = '<option value="">Selecione um médico</option>';
        medicos.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.nome} - ${m.especialidade}`;
            selMedico.appendChild(opt);
        });
    }
}

function filtrarPacientes() {
    const termo = document.getElementById('searchPaciente')?.value.toLowerCase() || '';
    const tbody = document.getElementById('listaPacientes');
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    for (let row of rows) {
        const nome = row.cells[1]?.textContent.toLowerCase() || '';
        const cpf = row.cells[2]?.textContent || '';
        row.style.display = nome.includes(termo) || cpf.includes(termo) ? '' : 'none';
    }
}

function filtrarMedicos() {
    const termo = document.getElementById('searchMedico')?.value.toLowerCase() || '';
    const tbody = document.getElementById('listaMedicos');
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    for (let row of rows) {
        const nome = row.cells[1]?.textContent.toLowerCase() || '';
        const especialidade = row.cells[2]?.textContent.toLowerCase() || '';
        row.style.display = nome.includes(termo) || especialidade.includes(termo) ? '' : 'none';
    }
}

function filtrarConsultas() {
    listarConsultas();
}

// ==================== NAVEGAÇÃO ====================
function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`.nav-btn[data-tab="${tabId}"]`)?.classList.add('active');
    
    if (tabId === 'dashboard') atualizarDashboard();
    if (tabId === 'pacientes') listarPacientes();
    if (tabId === 'medicos') listarMedicos();
    if (tabId === 'consultas') listarConsultas();
}

// ==================== MODAIS ====================
function abrirModalPaciente(paciente = null) {
    const modal = document.getElementById('modalPaciente');
    if (paciente) {
        document.getElementById('modalPacienteNome').value = paciente.nome;
        document.getElementById('modalPacienteCpf').value = paciente.cpf;
        document.getElementById('modalPacienteTelefone').value = paciente.telefone || '';
        document.getElementById('modalPacienteDataNasc').value = paciente.dataNasc || '';
    }
    modal.style.display = 'flex';
}

function abrirModalMedico(medico = null) {
    const modal = document.getElementById('modalMedico');
    if (medico) {
        document.getElementById('modalMedicoNome').value = medico.nome;
        document.getElementById('modalMedicoEspecialidade').value = medico.especialidade;
        document.getElementById('modalMedicoCrm').value = medico.crm || '';
    }
    modal.style.display = 'flex';
}

function abrirModalConsulta() {
    atualizarSelects();
    document.getElementById('modalConsulta').style.display = 'flex';
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function limparModalPaciente() {
    document.getElementById('modalPacienteNome').value = '';
    document.getElementById('modalPacienteCpf').value = '';
    document.getElementById('modalPacienteTelefone').value = '';
    document.getElementById('modalPacienteDataNasc').value = '';
}

function limparModalMedico() {
    document.getElementById('modalMedicoNome').value = '';
    document.getElementById('modalMedicoEspecialidade').value = '';
    document.getElementById('modalMedicoCrm').value = '';
}

function limparModalConsulta() {
    document.getElementById('modalConsultaPaciente').value = '';
    document.getElementById('modalConsultaMedico').value = '';
    document.getElementById('modalConsultaData').value = '';
}

// ==================== DOCUMENTAÇÃO ====================
function showDoc(tipo) {
    document.querySelectorAll('.doc-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.doc-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tipo)?.classList.add('active');
    document.querySelector(`.doc-btn[data-doc="${tipo}"]`)?.classList.add('active');
}

function showUML(tipo) {
    document.querySelectorAll('.uml-diagram').forEach(diagram => diagram.classList.remove('active'));
    document.querySelectorAll('.uml-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tipo}-diagram`)?.classList.add('active');
    document.querySelector(`.uml-btn[data-uml="${tipo}"]`)?.classList.add('active');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
    
    document.querySelectorAll('.doc-btn').forEach(btn => {
        btn.addEventListener('click', () => showDoc(btn.dataset.doc));
    });
    
    document.querySelectorAll('.uml-btn').forEach(btn => {
        btn.addEventListener('click', () => showUML(btn.dataset.uml));
    });
    
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    showTab('dashboard');
});