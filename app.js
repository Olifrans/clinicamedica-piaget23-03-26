

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
// class Validador {
//     static validarCPF(cpf, pacientes, idIgnorar = null) {
//         const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
//         if (!cpfRegex.test(cpf)) {
//             return { valido: false, mensagem: 'CPF inválido. Use formato 000.000.000-00' };
//         }
        
//         const cpfLimpo = cpf.replace(/[^\d]/g, '');
        
//         // Validar se CPF tem 11 dígitos
//         if (cpfLimpo.length !== 11) {
//             return { valido: false, mensagem: 'CPF deve conter 11 dígitos' };
//         }
        
//         // Validar dígitos verificadores do CPF
//         if (!this.validarDigitosCPF(cpfLimpo)) {
//             return { valido: false, mensagem: 'CPF inválido - dígitos verificadores incorretos' };
//         }
        
//         const existe = pacientes.some(p => p.cpf === cpfLimpo && p.id !== idIgnorar);
//         if (existe) {
//             return { valido: false, mensagem: 'CPF já cadastrado para outro paciente' };
//         }
        
//         return { valido: true };
//     }
    
//     static validarDigitosCPF(cpf) {
//         // Remove caracteres não numéricos
//         const cpfLimpo = cpf.replace(/[^\d]/g, '');
        
//         // Verifica se tem 11 dígitos
//         if (cpfLimpo.length !== 11) return false;
        
//         // Verifica se todos os dígitos são iguais
//         if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
        
//         // Validação do primeiro dígito verificador
//         let soma = 0;
//         for (let i = 0; i < 9; i++) {
//             soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
//         }
//         let resto = 11 - (soma % 11);
//         let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
        
//         if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false;
        
//         // Validação do segundo dígito verificador
//         soma = 0;
//         for (let i = 0; i < 10; i++) {
//             soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
//         }
//         resto = 11 - (soma % 11);
//         let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
        
//         return digitoVerificador2 === parseInt(cpfLimpo.charAt(10));
//     }

//     static validarDataConsulta(dataHora, consultas, medicoId, idIgnorar = null) {
//         const data = new Date(dataHora);
//         const agora = new Date();
        
//         if (data < agora) {
//             return { valido: false, mensagem: 'Data/Hora não pode ser no passado' };
//         }
        
//         const conflito = consultas.some(c => 
//             c.medicoId == medicoId && 
//             c.dataHora === dataHora && 
//             c.id !== idIgnorar &&
//             c.status !== 'CANCELADA'
//         );
        
//         if (conflito) {
//             return { valido: false, mensagem: 'Médico já possui consulta neste horário' };
//         }
        
//         return { valido: true };
//     }

//     static validarPaciente(paciente) {
//         if (!paciente.nome || paciente.nome.trim() === '') {
//             return { valido: false, mensagem: 'Nome é obrigatório' };
//         }
//         if (!paciente.cpf || paciente.cpf.trim() === '') {
//             return { valido: false, mensagem: 'CPF é obrigatório' };
//         }
//         if (paciente.email && !this.validarEmail(paciente.email)) {
//             return { valido: false, mensagem: 'E-mail inválido' };
//         }
//         return { valido: true };
//     }

//     static validarMedico(medico) {
//         if (!medico.nome || medico.nome.trim() === '') {
//             return { valido: false, mensagem: 'Nome é obrigatório' };
//         }
//         if (!medico.especialidade || medico.especialidade.trim() === '') {
//             return { valido: false, mensagem: 'Especialidade é obrigatória' };
//         }
//         if (medico.email && !this.validarEmail(medico.email)) {
//             return { valido: false, mensagem: 'E-mail inválido' };
//         }
//         return { valido: true };
//     }
    
//     static validarEmail(email) {
//         if (!email) return true;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     }
// }


// ==================== CAMADA DE NEGÓCIO (CORRIGIDA) ====================
class Validador {
    static validarCPF(cpf, pacientes, idIgnorar = null) {
        // Remove caracteres não numéricos
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        
        // Verificar se tem 11 dígitos
        if (cpfLimpo.length !== 11) {
            return { valido: false, mensagem: 'CPF deve conter 11 dígitos' };
        }
        
        // Verificar se todos os dígitos são iguais (CPF inválido)
        if (/^(\d)\1{10}$/.test(cpfLimpo)) {
            return { valido: false, mensagem: 'CPF inválido' };
        }
        
        // Validação dos dígitos verificadores
        let soma = 0;
        let resto;
        
        // Primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
            return { valido: false, mensagem: 'CPF inválido - dígito verificador incorreto' };
        }
        
        // Segundo dígito verificador
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
            return { valido: false, mensagem: 'CPF inválido - dígito verificador incorreto' };
        }
        
        // Verificar se CPF já existe (ignorando o próprio paciente em edição)
        const existe = pacientes.some(p => p.cpf === cpfLimpo && p.id !== idIgnorar);
        if (existe) {
            return { valido: false, mensagem: 'CPF já cadastrado para outro paciente' };
        }
        
        return { valido: true, cpfLimpo: cpfLimpo };
    }
    
    // Método alternativo mais flexível para validação de CPF
    static validarCPFFlexivel(cpf) {
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        
        if (cpfLimpo.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
        
        let soma = 0;
        let resto;
        
        // Primeiro dígito
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
        
        // Segundo dígito
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
        
        return true;
    }

    static validarDataConsulta(dataHora, consultas, medicoId, idIgnorar = null) {
        if (!dataHora) {
            return { valido: false, mensagem: 'Data e hora são obrigatórias' };
        }
        
        const data = new Date(dataHora);
        const agora = new Date();
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
            return { valido: false, mensagem: 'Data/Hora inválida' };
        }
        
        // Permitir agendamento para o mesmo dia, desde que seja no futuro
        if (data < agora) {
            return { valido: false, mensagem: 'Data/Hora não pode ser no passado' };
        }
        
        // Verificar conflito de horário com o mesmo médico
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
        if (paciente.email && !this.validarEmail(paciente.email)) {
            return { valido: false, mensagem: 'E-mail inválido' };
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
        if (medico.email && !this.validarEmail(medico.email)) {
            return { valido: false, mensagem: 'E-mail inválido' };
        }
        return { valido: true };
    }
    
    static validarEmail(email) {
        if (!email) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static formatarCPF(cpf) {
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        if (cpfLimpo.length !== 11) return cpf;
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}


// ==================== CAMADA DE CONTROLE ====================
const dataService = new DataService();
let pacientes = [];
let medicos = [];
let consultas = [];
let pacienteEmEdicao = null;
let medicoEmEdicao = null;

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



// ==================== CRUD PACIENTES (CORRIGIDO) ====================
// function listarPacientes() {
//     const tbody = document.getElementById('listaPacientes');
//     if (!tbody) return;
    
//     tbody.innerHTML = '';
//     pacientes.forEach(p => {
//         const row = tbody.insertRow();
//         row.insertCell(0).textContent = p.id;
//         row.insertCell(1).textContent = p.nome;
//         row.insertCell(2).textContent = p.cpf;
//         row.insertCell(3).textContent = p.telefone || '-';
//         row.insertCell(4).textContent = p.email || '-';
//         row.insertCell(5).textContent = p.dataNasc ? formatarData(p.dataNasc) : '-';
        
//         const acoes = row.insertCell(6);
//         acoes.innerHTML = `
//             <button class="btn-warning" onclick="editarPaciente(${p.id})" title="Editar">✏️</button>
//             <button class="btn-danger" onclick="excluirPaciente(${p.id})" title="Excluir">🗑️</button>
//         `;
//     });
// }


// ==================== CRUD PACIENTES (CORRIGIDO) ====================

function adicionarPaciente(paciente) {
    // Validar dados básicos
    const validacao = Validador.validarPaciente(paciente);
    if (!validacao.valido) {
        alert(validacao.mensagem);
        return false;
    }
    
    // Validar CPF
    const validacaoCPF = Validador.validarCPF(paciente.cpf, pacientes);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return false;
    }
    
    // Criar paciente com CPF limpo
    const novoPaciente = {
        id: Date.now(),
        nome: paciente.nome,
        cpf: validacaoCPF.cpfLimpo || paciente.cpf.replace(/[^\d]/g, ''),
        telefone: paciente.telefone || '',
        email: paciente.email || '',
        dataNasc: paciente.dataNasc || ''
    };
    
    pacientes.push(novoPaciente);
    salvarPacientes();
    listarPacientes();
    atualizarDashboard();
    atualizarSelects();
    return true;
}

function atualizarPaciente() {
    if (!pacienteEmEdicao) return;
    
    const nome = document.getElementById('modalPacienteNome').value;
    const cpf = document.getElementById('modalPacienteCpf').value;
    const telefone = document.getElementById('modalPacienteTelefone').value;
    const email = document.getElementById('modalPacienteEmail').value;
    const dataNasc = document.getElementById('modalPacienteDataNasc').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('⚠️ Nome é obrigatório');
        return;
    }
    
    // Validar CPF (ignorando o próprio paciente)
    const validacaoCPF = Validador.validarCPF(cpf, pacientes, pacienteEmEdicao.id);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return;
    }
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('⚠️ E-mail inválido');
        return;
    }
    
    // Atualizar os dados
    pacienteEmEdicao.nome = nome;
    pacienteEmEdicao.cpf = validacaoCPF.cpfLimpo || cpf.replace(/[^\d]/g, '');
    pacienteEmEdicao.telefone = telefone;
    pacienteEmEdicao.email = email;
    pacienteEmEdicao.dataNasc = dataNasc;
    
    // Salvar no localStorage
    salvarPacientes();
    
    // Atualizar a lista
    listarPacientes();
    atualizarDashboard();
    atualizarSelects();
    
    // Fechar o modal e resetar
    fecharModal('modalPaciente');
    resetarModalPaciente();
    
    alert('✅ Paciente atualizado com sucesso!');
}

function salvarPaciente() {
    const nome = document.getElementById('modalPacienteNome').value;
    const cpf = document.getElementById('modalPacienteCpf').value;
    const telefone = document.getElementById('modalPacienteTelefone').value;
    const email = document.getElementById('modalPacienteEmail').value;
    const dataNasc = document.getElementById('modalPacienteDataNasc').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('⚠️ Nome é obrigatório');
        return;
    }
    
    // Validar CPF
    const validacaoCPF = Validador.validarCPF(cpf, pacientes);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return;
    }
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('⚠️ E-mail inválido');
        return;
    }
    
    const paciente = {
        nome: nome,
        cpf: validacaoCPF.cpfLimpo || cpf.replace(/[^\d]/g, ''),
        telefone: telefone,
        email: email,
        dataNasc: dataNasc
    };
    
    if (adicionarPaciente(paciente)) {
        fecharModal('modalPaciente');
        resetarModalPaciente();
        alert('✅ Paciente cadastrado com sucesso!');
    }
}




function editarPaciente(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (paciente) {
        pacienteEmEdicao = paciente;
        
        // Preencher o modal com os dados do paciente
        document.getElementById('modalPacienteNome').value = paciente.nome;
        document.getElementById('modalPacienteCpf').value = paciente.cpf;
        document.getElementById('modalPacienteTelefone').value = paciente.telefone || '';
        document.getElementById('modalPacienteEmail').value = paciente.email || '';
        document.getElementById('modalPacienteDataNasc').value = paciente.dataNasc || '';
        
        // Mudar o título e o botão do modal para modo edição
        const modalTitle = document.querySelector('#modalPaciente h3');
        const saveButton = document.querySelector('#modalPaciente .btn-primary');
        
        modalTitle.textContent = '✏️ Editar Paciente';
        saveButton.textContent = 'Atualizar';
        saveButton.onclick = () => atualizarPaciente();
        
        // Abrir o modal
        document.getElementById('modalPaciente').style.display = 'flex';
    }
}

function atualizarPaciente() {
    if (!pacienteEmEdicao) return;
    
    const nome = document.getElementById('modalPacienteNome').value;
    const cpf = document.getElementById('modalPacienteCpf').value;
    const telefone = document.getElementById('modalPacienteTelefone').value;
    const email = document.getElementById('modalPacienteEmail').value;
    const dataNasc = document.getElementById('modalPacienteDataNasc').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('Nome é obrigatório');
        return;
    }
    
    // Validar CPF (ignorando o próprio paciente)
    const validacaoCPF = Validador.validarCPF(cpf, pacientes, pacienteEmEdicao.id);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return;
    }
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('E-mail inválido');
        return;
    }
    
    // Atualizar os dados
    pacienteEmEdicao.nome = nome;
    pacienteEmEdicao.cpf = cpfLimpo;
    pacienteEmEdicao.telefone = telefone;
    pacienteEmEdicao.email = email;
    pacienteEmEdicao.dataNasc = dataNasc;
    
    // Salvar no localStorage
    salvarPacientes();
    
    // Atualizar a lista
    listarPacientes();
    atualizarDashboard();
    atualizarSelects();
    
    // Fechar o modal e resetar
    fecharModal('modalPaciente');
    resetarModalPaciente();
    
    alert('✅ Paciente atualizado com sucesso!');
}

function resetarModalPaciente() {
    // Resetar as variáveis
    pacienteEmEdicao = null;
    
    // Limpar os campos
    document.getElementById('modalPacienteNome').value = '';
    document.getElementById('modalPacienteCpf').value = '';
    document.getElementById('modalPacienteTelefone').value = '';
    document.getElementById('modalPacienteEmail').value = '';
    document.getElementById('modalPacienteDataNasc').value = '';
    
    // Restaurar título e botão para modo cadastro
    const modalTitle = document.querySelector('#modalPaciente h3');
    const saveButton = document.querySelector('#modalPaciente .btn-primary');
    
    modalTitle.textContent = 'Cadastrar Paciente';
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => salvarPaciente();
}

function salvarPaciente() {
    const nome = document.getElementById('modalPacienteNome').value;
    const cpf = document.getElementById('modalPacienteCpf').value;
    const telefone = document.getElementById('modalPacienteTelefone').value;
    const email = document.getElementById('modalPacienteEmail').value;
    const dataNasc = document.getElementById('modalPacienteDataNasc').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('Nome é obrigatório');
        return;
    }
    
    // Validar CPF
    const validacaoCPF = Validador.validarCPF(cpf, pacientes);
    if (!validacaoCPF.valido) {
        alert(validacaoCPF.mensagem);
        return;
    }
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('E-mail inválido');
        return;
    }
    
    const paciente = {
        id: Date.now(),
        nome: nome,
        cpf: cpfLimpo,
        telefone: telefone,
        email: email,
        dataNasc: dataNasc
    };
    
    pacientes.push(paciente);
    salvarPacientes();
    listarPacientes();
    atualizarDashboard();
    atualizarSelects();
    
    fecharModal('modalPaciente');
    resetarModalPaciente();
    
    alert('✅ Paciente cadastrado com sucesso!');
}

function excluirPaciente(id) {
    if (confirm('⚠️ Tem certeza que deseja excluir este paciente?')) {
        const temConsultas = consultas.some(c => c.pacienteId == id && c.status !== 'CANCELADA');
        if (temConsultas) {
            alert('❌ Não é possível excluir paciente com consultas agendadas ou realizadas');
            return;
        }
        pacientes = pacientes.filter(p => p.id !== id);
        salvarPacientes();
        listarPacientes();
        atualizarDashboard();
        atualizarSelects();
        alert('✅ Paciente excluído com sucesso!');
    }
}

// ==================== CRUD MÉDICOS (CORRIGIDO) ====================
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
        row.insertCell(4).textContent = m.email || '-';
        
        const acoes = row.insertCell(5);
        acoes.innerHTML = `
            <button class="btn-warning" onclick="editarMedico(${m.id})" title="Editar">✏️</button>
            <button class="btn-danger" onclick="excluirMedico(${m.id})" title="Excluir">🗑️</button>
        `;
    });
}

function editarMedico(id) {
    const medico = medicos.find(m => m.id === id);
    if (medico) {
        medicoEmEdicao = medico;
        
        // Preencher o modal com os dados do médico
        document.getElementById('modalMedicoNome').value = medico.nome;
        document.getElementById('modalMedicoEspecialidade').value = medico.especialidade;
        document.getElementById('modalMedicoCrm').value = medico.crm || '';
        document.getElementById('modalMedicoEmail').value = medico.email || '';
        
        // Mudar o título e o botão do modal para modo edição
        const modalTitle = document.querySelector('#modalMedico h3');
        const saveButton = document.querySelector('#modalMedico .btn-primary');
        
        modalTitle.textContent = '✏️ Editar Médico';
        saveButton.textContent = 'Atualizar';
        saveButton.onclick = () => atualizarMedico();
        
        // Abrir o modal
        document.getElementById('modalMedico').style.display = 'flex';
    }
}

function atualizarMedico() {
    if (!medicoEmEdicao) return;
    
    const nome = document.getElementById('modalMedicoNome').value;
    const especialidade = document.getElementById('modalMedicoEspecialidade').value;
    const crm = document.getElementById('modalMedicoCrm').value;
    const email = document.getElementById('modalMedicoEmail').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('Nome é obrigatório');
        return;
    }
    
    // Validar especialidade
    if (!especialidade || especialidade.trim() === '') {
        alert('Especialidade é obrigatória');
        return;
    }
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('E-mail inválido');
        return;
    }
    
    // Atualizar os dados
    medicoEmEdicao.nome = nome;
    medicoEmEdicao.especialidade = especialidade;
    medicoEmEdicao.crm = crm;
    medicoEmEdicao.email = email;
    
    // Salvar no localStorage
    salvarMedicos();
    
    // Atualizar a lista
    listarMedicos();
    atualizarDashboard();
    atualizarSelects();
    
    // Fechar o modal e resetar
    fecharModal('modalMedico');
    resetarModalMedico();
    
    alert('✅ Médico atualizado com sucesso!');
}

function resetarModalMedico() {
    // Resetar as variáveis
    medicoEmEdicao = null;
    
    // Limpar os campos
    document.getElementById('modalMedicoNome').value = '';
    document.getElementById('modalMedicoEspecialidade').value = '';
    document.getElementById('modalMedicoCrm').value = '';
    document.getElementById('modalMedicoEmail').value = '';
    
    // Restaurar título e botão para modo cadastro
    const modalTitle = document.querySelector('#modalMedico h3');
    const saveButton = document.querySelector('#modalMedico .btn-primary');
    
    modalTitle.textContent = 'Cadastrar Médico';
    saveButton.textContent = 'Salvar';
    saveButton.onclick = () => salvarMedico();
}

function salvarMedico() {
    const nome = document.getElementById('modalMedicoNome').value;
    const especialidade = document.getElementById('modalMedicoEspecialidade').value;
    const crm = document.getElementById('modalMedicoCrm').value;
    const email = document.getElementById('modalMedicoEmail').value;
    
    // Validar nome
    if (!nome || nome.trim() === '') {
        alert('Nome é obrigatório');
        return;
    }
    
    // Validar especialidade
    if (!especialidade || especialidade.trim() === '') {
        alert('Especialidade é obrigatória');
        return;
    }
    
    // Validar email
    if (email && !Validador.validarEmail(email)) {
        alert('E-mail inválido');
        return;
    }
    
    const medico = {
        id: Date.now(),
        nome: nome,
        especialidade: especialidade,
        crm: crm,
        email: email
    };
    
    medicos.push(medico);
    salvarMedicos();
    listarMedicos();
    atualizarDashboard();
    atualizarSelects();
    
    fecharModal('modalMedico');
    resetarModalMedico();
    
    alert('✅ Médico cadastrado com sucesso!');
}

function excluirMedico(id) {
    if (confirm('⚠️ Tem certeza que deseja excluir este médico?')) {
        const temConsultas = consultas.some(c => c.medicoId == id && c.status !== 'CANCELADA');
        if (temConsultas) {
            alert('❌ Não é possível excluir médico com consultas agendadas ou realizadas');
            return;
        }
        medicos = medicos.filter(m => m.id !== id);
        salvarMedicos();
        listarMedicos();
        atualizarDashboard();
        atualizarSelects();
        alert('✅ Médico excluído com sucesso!');
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
            botoes += `<button class="btn-success" onclick="confirmarConsulta(${c.id})" title="Confirmar">✅</button>`;
        }
        if (c.status === 'AGENDADA' || c.status === 'CONFIRMADA') {
            botoes += `<button class="btn-success" onclick="realizarConsulta(${c.id})" title="Realizar">✓</button>`;
        }
        if (c.status !== 'CANCELADA' && c.status !== 'REALIZADA') {
            botoes += `<button class="btn-danger" onclick="cancelarConsulta(${c.id})" title="Cancelar">✗</button>`;
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
    
    // Se a opção de notificar estiver marcada, agenda lembrete
    const notificar = document.getElementById('notificarPaciente')?.checked;
    if (notificar && notificationService) {
        notificationService.agendarLembretePersonalizado(consulta.id, 1440); // 24h antes
        notificationService.agendarLembretePersonalizado(consulta.id, 60); // 1h antes
    }
    
    return true;
}

function confirmarConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (consulta) {
        consulta.status = 'CONFIRMADA';
        salvarConsultas();
        listarConsultas();
        atualizarDashboard();
        
        // Enviar notificação de confirmação
        if (notificationService) {
            const paciente = pacientes.find(p => p.id == consulta.pacienteId);
            const medico = medicos.find(m => m.id == consulta.medicoId);
            if (paciente && medico) {
                notificationService.exibirNotificacaoUI({
                    id: Date.now(),
                    titulo: '✅ Consulta Confirmada',
                    mensagem: `Consulta com ${medico.nome} confirmada para ${new Date(consulta.dataHora).toLocaleString()}`,
                    tipo: 'CONFIRMACAO'
                });
            }
        }
        
        alert('✅ Consulta confirmada com sucesso!');
    }
}

function realizarConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (consulta) {
        consulta.status = 'REALIZADA';
        salvarConsultas();
        listarConsultas();
        atualizarDashboard();
        alert('✅ Consulta marcada como realizada!');
    }
}

function cancelarConsulta(id) {
    if (confirm('⚠️ Cancelar esta consulta?')) {
        const consulta = consultas.find(c => c.id === id);
        if (consulta) {
            consulta.status = 'CANCELADA';
            salvarConsultas();
            listarConsultas();
            atualizarDashboard();
            
            // Enviar notificação de cancelamento
            if (notificationService) {
                const paciente = pacientes.find(p => p.id == consulta.pacienteId);
                const medico = medicos.find(m => m.id == consulta.medicoId);
                if (paciente && medico) {
                    notificationService.exibirNotificacaoUI({
                        id: Date.now(),
                        titulo: '❌ Consulta Cancelada',
                        mensagem: `Consulta com ${medico.nome} em ${new Date(consulta.dataHora).toLocaleString()} foi cancelada`,
                        tipo: 'CANCELAMENTO'
                    });
                }
            }
            
            alert('✅ Consulta cancelada com sucesso!');
        }
    }
}

function salvarConsulta() {
    const pacienteId = parseInt(document.getElementById('modalConsultaPaciente').value);
    const medicoId = parseInt(document.getElementById('modalConsultaMedico').value);
    const dataHora = document.getElementById('modalConsultaData').value;
    
    if (!pacienteId || !medicoId || !dataHora) {
        alert('⚠️ Preencha todos os campos');
        return;
    }
    
    const consulta = { pacienteId, medicoId, dataHora };
    
    if (adicionarConsulta(consulta)) {
        fecharModal('modalConsulta');
        limparModalConsulta();
        alert('✅ Consulta agendada com sucesso!');
    }
}

// ==================== DASHBOARD ====================
function atualizarDashboard() {
    const totalPacientes = document.getElementById('totalPacientes');
    const totalMedicos = document.getElementById('totalMedicos');
    const totalConsultas = document.getElementById('totalConsultas');
    const totalNotificacoes = document.getElementById('totalNotificacoes');
    const proximasConsultas = document.getElementById('proximasConsultas');
    
    if (totalPacientes) totalPacientes.textContent = pacientes.length;
    if (totalMedicos) totalMedicos.textContent = medicos.length;
    if (totalConsultas) totalConsultas.textContent = consultas.filter(c => c.status !== 'CANCELADA').length;
    if (totalNotificacoes && notificationService) {
        const naoLidas = notificationService.notificacoes?.filter(n => !n.lida).length || 0;
        totalNotificacoes.textContent = naoLidas;
    }
    
    if (proximasConsultas) {
        const agora = new Date();
        const proximas = consultas
            .filter(c => c.status !== 'CANCELADA' && new Date(c.dataHora) > agora)
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
            .slice(0, 5);
        
        proximasConsultas.innerHTML = '';
        if (proximas.length === 0) {
            proximasConsultas.innerHTML = '<li>📅 Nenhuma consulta agendada</li>';
        } else {
            proximas.forEach(c => {
                const paciente = pacientes.find(p => p.id == c.pacienteId);
                const medico = medicos.find(m => m.id == c.medicoId);
                const li = document.createElement('li');
                li.innerHTML = `🕐 ${paciente?.nome} com ${medico?.nome} - ${new Date(c.dataHora).toLocaleString()} (${c.status})`;
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
        selPaciente.innerHTML = '<option value="">📋 Selecione um paciente</option>';
        pacientes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nome} - ${p.cpf}`;
            selPaciente.appendChild(opt);
        });
    }
    
    if (selMedico) {
        selMedico.innerHTML = '<option value="">👨‍⚕️ Selecione um médico</option>';
        medicos.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.nome} - ${m.especialidade}`;
            selMedico.appendChild(opt);
        });
    }
}

function formatarData(dataString) {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
    if (tabId === 'reports' && typeof gerarRelatorio === 'function') {
        // Inicializar gráfico vazio se necessário
        const ctx = document.getElementById('graficoRelatorio')?.getContext('2d');
        if (ctx && !window.graficoRelatorio) {
            window.graficoRelatorio = new Chart(ctx, {
                type: 'bar',
                data: { labels: [], datasets: [] },
                options: { responsive: true }
            });
        }
    }
}

// ==================== MODAIS ====================
function abrirModalPaciente(paciente = null) {
    if (paciente) {
        editarPaciente(paciente.id);
    } else {
        resetarModalPaciente();
        document.getElementById('modalPaciente').style.display = 'flex';
    }
}

function abrirModalMedico(medico = null) {
    if (medico) {
        editarMedico(medico.id);
    } else {
        resetarModalMedico();
        document.getElementById('modalMedico').style.display = 'flex';
    }
}

function abrirModalConsulta() {
    atualizarSelects();
    document.getElementById('modalConsulta').style.display = 'flex';
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function limparModalPaciente() {
    resetarModalPaciente();
}

function limparModalMedico() {
    resetarModalMedico();
}

function limparModalConsulta() {
    document.getElementById('modalConsultaPaciente').value = '';
    document.getElementById('modalConsultaMedico').value = '';
    document.getElementById('modalConsultaData').value = '';
    const notificarCheckbox = document.getElementById('notificarPaciente');
    if (notificarCheckbox) notificarCheckbox.checked = false;
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

// ==================== EXPORTAÇÕES ====================
function exportarConsultasPDF() {
    const element = document.getElementById('tabelaConsultas');
    if (!element) return;
    
    const opt = {
        margin: 1,
        filename: `consultas_${new Date().toISOString().slice(0,19)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
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
    
    // Inicializar serviço de notificações se disponível
    if (typeof notificationService !== 'undefined' && notificationService) {
        setTimeout(() => {
            notificationService.carregarNotificacoes();
        }, 500);
    }
    
    console.log('✅ Sistema inicializado com sucesso!');
});