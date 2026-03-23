// ===== BANCO DE DADOS (Simulado) =====
let pacientes = [];
let medicos = [];
let consultas = [];

// ===== NAVEGAÇÃO =====
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
    document.getElementById(tab).classList.remove("hidden");
}

// ===== PACIENTES =====
function addPaciente() {
    const nome = document.getElementById("pNome").value;
    const cpf = document.getElementById("pCpf").value;

    const paciente = {
        id: Date.now(),
        nome,
        cpf
    };

    pacientes.push(paciente);
    renderPacientes();
    atualizarSelects();
}

function renderPacientes() {
    const lista = document.getElementById("listaPacientes");
    lista.innerHTML = "";

    pacientes.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.nome} - ${p.cpf}`;
        lista.appendChild(li);
    });
}

// ===== MEDICOS =====
function addMedico() {
    const nome = document.getElementById("mNome").value;
    const esp = document.getElementById("mEsp").value;

    const medico = {
        id: Date.now(),
        nome,
        especialidade: esp
    };

    medicos.push(medico);
    renderMedicos();
    atualizarSelects();
}

function renderMedicos() {
    const lista = document.getElementById("listaMedicos");
    lista.innerHTML = "";

    medicos.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.nome} - ${m.especialidade}`;
        lista.appendChild(li);
    });
}

// ===== CONSULTAS =====
function agendar() {
    const pacienteId = document.getElementById("selPaciente").value;
    const medicoId = document.getElementById("selMedico").value;
    const data = document.getElementById("dataConsulta").value;

    if (!pacienteId || !medicoId || !data) {
        alert("Preencha todos os campos");
        return;
    }

    const consulta = {
        id: Date.now(),
        pacienteId,
        medicoId,
        data,
        status: "AGENDADA"
    };

    consultas.push(consulta);
    renderConsultas();
}

function renderConsultas() {
    const lista = document.getElementById("listaConsultas");
    lista.innerHTML = "";

    consultas.forEach(c => {
        const paciente = pacientes.find(p => p.id == c.pacienteId);
        const medico = medicos.find(m => m.id == c.medicoId);

        const li = document.createElement("li");
        li.textContent = `${paciente.nome} com ${medico.nome} em ${c.data} (${c.status})`;
        lista.appendChild(li);
    });
}

// ===== AUX =====
function atualizarSelects() {
    const selP = document.getElementById("selPaciente");
    const selM = document.getElementById("selMedico");

    selP.innerHTML = "";
    selM.innerHTML = "";

    pacientes.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nome;
        selP.appendChild(opt);
    });

    medicos.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.nome;
        selM.appendChild(opt);
    });
}

// ===== UML =====
function showUML(tab) {
    document.querySelectorAll(".umlTab").forEach(t => t.classList.add("hidden"));
    document.getElementById(tab).classList.remove("hidden");
}