// ==================== REPORTS MODULE ====================
let graficoRelatorio = null;

function gerarRelatorio() {
    const tipo = document.getElementById('tipoRelatorio').value;
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    let dados = {};
    let titulo = '';
    
    switch(tipo) {
        case 'consultas':
            dados = gerarRelatorioConsultas(dataInicio, dataFim);
            titulo = 'Consultas por Período';
            break;
        case 'pacientes':
            dados = gerarRelatorioPacientes();
            titulo = 'Pacientes Cadastrados';
            break;
        case 'medicos':
            dados = gerarRelatorioMedicos();
            titulo = 'Médicos por Especialidade';
            break;
        case 'financeiro':
            dados = gerarRelatorioFinanceiro(dataInicio, dataFim);
            titulo = 'Projeção Financeira';
            break;
        case 'ocupacao':
            dados = gerarRelatorioOcupacao();
            titulo = 'Taxa de Ocupação';
            break;
    }
    
    atualizarGrafico(titulo, dados);
    atualizarDetalhes(tipo, dados);
}

function gerarRelatorioConsultas(dataInicio, dataFim) {
    let consultasFiltradas = consultas;
    
    if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59);
        
        consultasFiltradas = consultas.filter(c => {
            const dataConsulta = new Date(c.dataHora);
            return dataConsulta >= inicio && dataConsulta <= fim;
        });
    }
    
    const porStatus = {
        'AGENDADA': 0,
        'CONFIRMADA': 0,
        'REALIZADA': 0,
        'CANCELADA': 0
    };
    
    const porDia = {};
    
    consultasFiltradas.forEach(c => {
        porStatus[c.status]++;
        
        const data = new Date(c.dataHora).toLocaleDateString();
        porDia[data] = (porDia[data] || 0) + 1;
    });
    
    return {
        tipo: 'consultas',
        status: porStatus,
        porDia: porDia,
        total: consultasFiltradas.length,
        periodo: { inicio: dataInicio, fim: dataFim }
    };
}

function gerarRelatorioPacientes() {
    const porMes = {};
    const porIdade = {
        '0-18': 0,
        '19-30': 0,
        '31-50': 0,
        '51+': 0
    };
    
    pacientes.forEach(p => {
        if (p.dataNasc) {
            const idade = calcularIdade(p.dataNasc);
            if (idade <= 18) porIdade['0-18']++;
            else if (idade <= 30) porIdade['19-30']++;
            else if (idade <= 50) porIdade['31-50']++;
            else porIdade['51+']++;
        }
        
        const mes = new Date(p.id).toLocaleString('pt-BR', { month: 'long' });
        porMes[mes] = (porMes[mes] || 0) + 1;
    });
    
    return {
        tipo: 'pacientes',
        total: pacientes.length,
        porIdade: porIdade,
        porMes: porMes
    };
}

function gerarRelatorioMedicos() {
    const porEspecialidade = {};
    
    medicos.forEach(m => {
        porEspecialidade[m.especialidade] = (porEspecialidade[m.especialidade] || 0) + 1;
    });
    
    const consultasPorMedico = {};
    medicos.forEach(m => {
        const totalConsultas = consultas.filter(c => c.medicoId == m.id && c.status !== 'CANCELADA').length;
        consultasPorMedico[m.nome] = totalConsultas;
    });
    
    return {
        tipo: 'medicos',
        total: medicos.length,
        porEspecialidade: porEspecialidade,
        consultasPorMedico: consultasPorMedico
    };
}

function gerarRelatorioFinanceiro(dataInicio, dataFim) {
    let consultasFiltradas = consultas;
    
    if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59);
        
        consultasFiltradas = consultas.filter(c => {
            const dataConsulta = new Date(c.dataHora);
            return dataConsulta >= inicio && dataConsulta <= fim;
        });
    }
    
    const VALOR_CONSULTA = 250;
    const VALOR_PLANO = 50;
    const PERCENTUAL_PLANO = 0.35;
    
    const totalConsultas = consultasFiltradas.length;
    const consultasParticular = Math.floor(totalConsultas * (1 - PERCENTUAL_PLANO));
    const consultasPlano = totalConsultas - consultasParticular;
    
    const receitaTotal = (consultasParticular * VALOR_CONSULTA) + (consultasPlano * VALOR_PLANO);
    const mediaPorConsulta = totalConsultas > 0 ? receitaTotal / totalConsultas : 0;
    
    return {
        tipo: 'financeiro',
        totalConsultas: totalConsultas,
        consultasParticular: consultasParticular,
        consultasPlano: consultasPlano,
        receitaTotal: receitaTotal,
        mediaPorConsulta: mediaPorConsulta,
        valorConsultaParticular: VALOR_CONSULTA,
        valorConsultaPlano: VALOR_PLANO
    };
}

function gerarRelatorioOcupacao() {
    const proximos7Dias = [];
    const hoje = new Date();
    
    for (let i = 0; i < 7; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        const dataStr = data.toLocaleDateString();
        
        const consultasDia = consultas.filter(c => {
            const dataConsulta = new Date(c.dataHora);
            return dataConsulta.toDateString() === data.toDateString() && c.status !== 'CANCELADA';
        });
        
        const capacidadeMaxima = 10;
        const ocupacao = (consultasDia.length / capacidadeMaxima) * 100;
        
        proximos7Dias.push({
            data: dataStr,
            consultas: consultasDia.length,
            capacidade: capacidadeMaxima,
            ocupacao: ocupacao
        });
    }
    
    return {
        tipo: 'ocupacao',
        proximosDias: proximos7Dias,
        mediaOcupacao: proximos7Dias.reduce((sum, d) => sum + d.ocupacao, 0) / 7
    };
}

function atualizarGrafico(titulo, dados) {
    const ctx = document.getElementById('graficoRelatorio').getContext('2d');
    
    if (graficoRelatorio) {
        graficoRelatorio.destroy();
    }
    
    let labels = [];
    let valores = [];
    let tipoGrafico = 'bar';
    
    if (dados.tipo === 'consultas' && dados.status) {
        labels = Object.keys(dados.status);
        valores = Object.values(dados.status);
        tipoGrafico = 'bar';
    } else if (dados.tipo === 'pacientes' && dados.porMes) {
        labels = Object.keys(dados.porMes);
        valores = Object.values(dados.porMes);
    } else if (dados.tipo === 'medicos' && dados.porEspecialidade) {
        labels = Object.keys(dados.porEspecialidade);
        valores = Object.values(dados.porEspecialidade);
        tipoGrafico = 'pie';
    } else if (dados.tipo === 'financeiro') {
        labels = ['Particular', 'Plano de Saúde'];
        valores = [dados.consultasParticular, dados.consultasPlano];
        tipoGrafico = 'doughnut';
    } else if (dados.tipo === 'ocupacao' && dados.proximosDias) {
        labels = dados.proximosDias.map(d => d.data);
        valores = dados.proximosDias.map(d => d.ocupacao);
        tipoGrafico = 'line';
    }
    
    graficoRelatorio = new Chart(ctx, {
        type: tipoGrafico,
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: valores,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: titulo
                }
            }
        }
    });
}

function atualizarDetalhes(tipo, dados) {
    const container = document.getElementById('detalhesRelatorio');
    let html = '<div class="report-stats">';
    
    if (tipo === 'consultas') {
        html += `
            <div class="stat-item">
                <strong>📊 Total de Consultas:</strong> ${dados.total}
            </div>
            <div class="stat-item">
                <strong>✅ Agendadas:</strong> ${dados.status.AGENDADA}
            </div>
            <div class="stat-item">
                <strong>✓ Confirmadas:</strong> ${dados.status.CONFIRMADA}
            </div>
            <div class="stat-item">
                <strong>✔ Realizadas:</strong> ${dados.status.REALIZADA}
            </div>
            <div class="stat-item">
                <strong>❌ Canceladas:</strong> ${dados.status.CANCELADA}
            </div>
            <div class="stat-item">
                <strong>📅 Taxa de Efetividade:</strong> ${((dados.status.REALIZADA / dados.total) * 100).toFixed(1)}%
            </div>
        `;
    } else if (tipo === 'pacientes') {
        html += `
            <div class="stat-item">
                <strong>👥 Total de Pacientes:</strong> ${dados.total}
            </div>
            <div class="stat-item">
                <strong>👶 0-18 anos:</strong> ${dados.porIdade['0-18']}
            </div>
            <div class="stat-item">
                <strong>🧑 19-30 anos:</strong> ${dados.porIdade['19-30']}
            </div>
            <div class="stat-item">
                <strong>👨 31-50 anos:</strong> ${dados.porIdade['31-50']}
            </div>
            <div class="stat-item">
                <strong>👴 51+ anos:</strong> ${dados.porIdade['51+']}
            </div>
        `;
    } else if (tipo === 'medicos') {
        html += `
            <div class="stat-item">
                <strong>👨‍⚕️ Total de Médicos:</strong> ${dados.total}
            </div>
            <div class="stat-item">
                <strong>🏥 Especialidades:</strong> ${Object.keys(dados.porEspecialidade).length}
            </div>
        `;
        
        html += '<div class="medicos-detalhes"><strong>Consultas por Médico:</strong><ul>';
        for (let [medico, total] of Object.entries(dados.consultasPorMedico)) {
            html += `<li>${medico}: ${total} consultas</li>`;
        }
        html += '</ul></div>';
    } else if (tipo === 'financeiro') {
        html += `
            <div class="stat-item">
                <strong>💰 Receita Total:</strong> R$ ${dados.receitaTotal.toLocaleString()}
            </div>
            <div class="stat-item">
                <strong>📈 Média por Consulta:</strong> R$ ${dados.mediaPorConsulta.toFixed(2)}
            </div>
            <div class="stat-item">
                <strong>🏥 Consultas Particulares:</strong> ${dados.consultasParticular} (R$ ${dados.valorConsultaParticular} cada)
            </div>
            <div class="stat-item">
                <strong>📋 Consultas por Plano:</strong> ${dados.consultasPlano} (R$ ${dados.valorConsultaPlano} cada)
            </div>
            <div class="stat-item">
                <strong>📊 Projeção Mensal:</strong> R$ ${(dados.receitaTotal * 4).toLocaleString()}
            </div>
        `;
    } else if (tipo === 'ocupacao') {
        html += `
            <div class="stat-item">
                <strong>📊 Média de Ocupação:</strong> ${dados.mediaOcupacao.toFixed(1)}%
            </div>
        `;
        
        html += '<div class="ocupacao-detalhes"><strong>Próximos 7 dias:</strong><ul>';
        for (let dia of dados.proximosDias) {
            html += `<li>${dia.data}: ${dia.consultas}/${dia.capacidade} consultas (${dia.ocupacao.toFixed(1)}% ocupação)</li>`;
        }
        html += '</ul></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function exportarRelatorioPDF() {
    const element = document.getElementById('relatorioContainer');
    const opt = {
        margin: 1,
        filename: `relatorio_${new Date().toISOString().slice(0,19)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

function exportarRelatorioExcel() {
    const tipo = document.getElementById('tipoRelatorio').value;
    let dados = [];
    let nomeArquivo = `relatorio_${tipo}_${new Date().toISOString().slice(0,19)}`;
    
    if (tipo === 'consultas') {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const relatorio = gerarRelatorioConsultas(dataInicio, dataFim);
        
        dados = [
            ['Métrica', 'Valor'],
            ['Total de Consultas', relatorio.total],
            ['Agendadas', relatorio.status.AGENDADA],
            ['Confirmadas', relatorio.status.CONFIRMADA],
            ['Realizadas', relatorio.status.REALIZADA],
            ['Canceladas', relatorio.status.CANCELADA],
            ['Taxa de Efetividade', `${((relatorio.status.REALIZADA / relatorio.total) * 100).toFixed(1)}%`]
        ];
    } else if (tipo === 'financeiro') {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const relatorio = gerarRelatorioFinanceiro(dataInicio, dataFim);
        
        dados = [
            ['Métrica', 'Valor'],
            ['Total de Consultas', relatorio.totalConsultas],
            ['Consultas Particulares', relatorio.consultasParticular],
            ['Consultas Plano', relatorio.consultasPlano],
            ['Receita Total', `R$ ${relatorio.receitaTotal.toLocaleString()}`],
            ['Média por Consulta', `R$ ${relatorio.mediaPorConsulta.toFixed(2)}`],
            ['Projeção Mensal', `R$ ${(relatorio.receitaTotal * 4).toLocaleString()}`]
        ];
    } else if (tipo === 'pacientes') {
        const relatorio = gerarRelatorioPacientes();
        
        dados = [
            ['Métrica', 'Valor'],
            ['Total de Pacientes', relatorio.total],
            ['0-18 anos', relatorio.porIdade['0-18']],
            ['19-30 anos', relatorio.porIdade['19-30']],
            ['31-50 anos', relatorio.porIdade['31-50']],
            ['51+ anos', relatorio.porIdade['51+']]
        ];
    }
    
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
}