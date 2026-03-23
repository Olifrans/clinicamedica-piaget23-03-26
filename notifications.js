// ==================== NOTIFICATIONS MODULE ====================
class NotificationService {
    constructor() {
        this.notificacoes = [];
        this.intervaloVerificacao = null;
        this.permissoes = {
            browser: false,
            email: true
        };
        this.iniciarVerificacao();
    }
    
    iniciarVerificacao() {
        // Verificar a cada minuto
        this.intervaloVerificacao = setInterval(() => {
            this.verificarAgendamentos();
        }, 60000);
        
        // Verificar imediatamente
        this.verificarAgendamentos();
    }
    
    verificarAgendamentos() {
        const agora = new Date();
        const proximasConsultas = consultas.filter(c => {
            const dataConsulta = new Date(c.dataHora);
            const diffHoras = (dataConsulta - agora) / (1000 * 60 * 60);
            
            return c.status !== 'CANCELADA' && 
                   c.status !== 'REALIZADA' && 
                   diffHoras <= 24 && 
                   diffHoras > 0;
        });
        
        proximasConsultas.forEach(consulta => {
            const dataConsulta = new Date(consulta.dataHora);
            const diffHoras = (dataConsulta - agora) / (1000 * 60 * 60);
            
            let tipoNotificacao = null;
            if (diffHoras <= 1 && diffHoras > 0) {
                tipoNotificacao = 'URGENTE';
            } else if (diffHoras <= 24 && diffHoras > 1) {
                tipoNotificacao = 'LEMBRETE';
            }
            
            if (tipoNotificacao && !this.notificacaoEnviada(consulta.id, tipoNotificacao)) {
                this.enviarNotificacao(consulta, tipoNotificacao);
            }
        });
        
        this.atualizarBadgeNotificacoes();
    }
    
    notificacaoEnviada(consultaId, tipo) {
        return this.notificacoes.some(n => 
            n.consultaId === consultaId && 
            n.tipo === tipo &&
            n.enviada === true
        );
    }
    
    enviarNotificacao(consulta, tipo) {
        const paciente = pacientes.find(p => p.id == consulta.pacienteId);
        const medico = medicos.find(m => m.id == consulta.medicoId);
        const dataFormatada = new Date(consulta.dataHora).toLocaleString();
        
        let titulo = '';
        let mensagem = '';
        let icone = '';
        
        if (tipo === 'URGENTE') {
            titulo = '⚠️ Lembrete Urgente - Consulta em 1 hora!';
            mensagem = `Sua consulta com ${medico?.nome} está marcada para ${dataFormatada}. Não se atrase!`;
            icone = '🔔';
        } else {
            titulo = '📅 Lembrete de Consulta';
            mensagem = `Olá ${paciente?.nome}! Você tem uma consulta com ${medico?.nome} em ${dataFormatada}. Confirme sua presença.`;
            icone = '📅';
        }
        
        const notificacao = {
            id: Date.now(),
            consultaId: consulta.id,
            tipo: tipo,
            titulo: titulo,
            mensagem: mensagem,
            dataEnvio: new Date(),
            enviada: true,
            lida: false
        };
        
        this.notificacoes.push(notificacao);
        this.exibirNotificacaoUI(notificacao);
        
        if (this.permissoes.browser && Notification.permission === 'granted') {
            new Notification(titulo, {
                body: mensagem,
                icon: '🏥'
            });
        }
        
        if (this.permissoes.email && paciente?.email) {
            this.enviarEmailSimulado(paciente, consulta, medico);
        }
        
        this.salvarNotificacoes();
    }
    
    exibirNotificacaoUI(notificacao) {
        const container = document.getElementById('notificacoesRecentes');
        if (!container) return;
        
        const notifElement = document.createElement('div');
        notifElement.className = `notification-item ${notificacao.tipo.toLowerCase()}`;
        notifElement.innerHTML = `
            <div class="notification-icon">${notificacao.tipo === 'URGENTE' ? '⚠️' : '📅'}</div>
            <div class="notification-content">
                <div class="notification-title">${notificacao.titulo}</div>
                <div class="notification-message">${notificacao.mensagem}</div>
                <div class="notification-time">${new Date(notificacao.dataEnvio).toLocaleTimeString()}</div>
            </div>
            <button class="notification-close" onclick="fecharNotificacao(${notificacao.id})">✕</button>
        `;
        
        container.prepend(notifElement);
        
        // Limitar a 10 notificações
        while (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
        
        this.atualizarBadgeNotificacoes();
    }
    
    enviarEmailSimulado(paciente, consulta, medico) {
        const dataFormatada = new Date(consulta.dataHora).toLocaleString();
        
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">🏥 Clínica Saúde Total</h2>
                <p>Olá <strong>${paciente.nome}</strong>,</p>
                <p>Este é um lembrete da sua consulta agendada:</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>👨‍⚕️ Médico:</strong> ${medico.nome} - ${medico.especialidade}</p>
                    <p><strong>📅 Data:</strong> ${dataFormatada}</p>
                    <p><strong>📍 Local:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP</p>
                </div>
                <p>Por favor, confirme sua presença com antecedência.</p>
                <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">
                    * Este é um e-mail automático, por favor não responda.
                </p>
            </div>
        `;
        
        console.log(`📧 [EMAIL SIMULADO] Para: ${paciente.email}`);
        console.log(`📧 Assunto: Lembrete de Consulta - ${medico.nome}`);
        console.log(`📧 Conteúdo: ${emailContent.replace(/<[^>]*>/g, ' ').substring(0, 200)}...`);
        
        this.salvarLogEmail(paciente, consulta);
    }
    
    salvarLogEmail(paciente, consulta) {
        const logs = JSON.parse(localStorage.getItem('clinica_emails') || '[]');
        logs.push({
            id: Date.now(),
            pacienteId: paciente.id,
            pacienteNome: paciente.nome,
            pacienteEmail: paciente.email,
            consultaId: consulta.id,
            dataEnvio: new Date().toISOString(),
            status: 'enviado'
        });
        
        localStorage.setItem('clinica_emails', JSON.stringify(logs));
        
        if (logs.length > 100) {
            logs.shift();
        }
    }
    
    atualizarBadgeNotificacoes() {
        const naoLidas = this.notificacoes.filter(n => !n.lida).length;
        const badgeElement = document.getElementById('totalNotificacoes');
        if (badgeElement) {
            badgeElement.textContent = naoLidas;
        }
        
        const chatbotBadge = document.querySelector('.chatbot-badge');
        if (chatbotBadge && naoLidas > 0) {
            chatbotBadge.style.display = 'flex';
            chatbotBadge.textContent = naoLidas;
        } else if (chatbotBadge) {
            chatbotBadge.style.display = 'none';
        }
    }
    
    marcarComoLida(notificacaoId) {
        const notificacao = this.notificacoes.find(n => n.id === notificacaoId);
        if (notificacao) {
            notificacao.lida = true;
            this.salvarNotificacoes();
            this.atualizarBadgeNotificacoes();
        }
    }
    
    salvarNotificacoes() {
        localStorage.setItem('clinica_notificacoes', JSON.stringify(this.notificacoes));
    }
    
    carregarNotificacoes() {
        const saved = localStorage.getItem('clinica_notificacoes');
        if (saved) {
            this.notificacoes = JSON.parse(saved);
            this.notificacoes.forEach(n => this.exibirNotificacaoUI(n));
            this.atualizarBadgeNotificacoes();
        }
    }
    
    solicitarPermissaoBrowser() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.permissoes.browser = permission === 'granted';
                if (this.permissoes.browser) {
                    console.log('🔔 Notificações do navegador ativadas');
                }
            });
        }
    }
    
    agendarLembretePersonalizado(consultaId, minutosAntecedencia) {
        const consulta = consultas.find(c => c.id === consultaId);
        if (!consulta) return;
        
        const dataConsulta = new Date(consulta.dataHora);
        const dataLembrete = new Date(dataConsulta.getTime() - (minutosAntecedencia * 60 * 1000));
        
        if (dataLembrete > new Date()) {
            const agendamento = {
                id: Date.now(),
                consultaId: consultaId,
                dataLembrete: dataLembrete,
                minutosAntecedencia: minutosAntecedencia,
                ativo: true
            };
            
            const lembretes = JSON.parse(localStorage.getItem('clinica_lembretes') || '[]');
            lembretes.push(agendamento);
            localStorage.setItem('clinica_lembretes', JSON.stringify(lembretes));
            
            console.log(`⏰ Lembrete agendado para ${dataLembrete.toLocaleString()}`);
        }
    }
    
    pararVerificacao() {
        if (this.intervaloVerificacao) {
            clearInterval(this.intervaloVerificacao);
        }
    }
}

function fecharNotificacao(notificacaoId) {
    const container = document.getElementById('notificacoesRecentes');
    const notificacoes = notificationService.notificacoes;
    const notificacaoIndex = notificacoes.findIndex(n => n.id === notificacaoId);
    
    if (notificacaoIndex !== -1) {
        notificacoes[notificacaoIndex].lida = true;
        notificationService.salvarNotificacoes();
        
        const elemento = container.querySelector(`[data-id="${notificacaoId}"]`);
        if (elemento) {
            elemento.remove();
        }
        
        notificationService.atualizarBadgeNotificacoes();
    }
}

function marcarTodasNotificacoesLidas() {
    notificationService.notificacoes.forEach(n => n.lida = true);
    notificationService.salvarNotificacoes();
    notificationService.atualizarBadgeNotificacoes();
    
    const container = document.getElementById('notificacoesRecentes');
    if (container) {
        container.innerHTML = '';
    }
}

function exportarLogEmails() {
    const logs = JSON.parse(localStorage.getItem('clinica_emails') || '[]');
    const ws = XLSX.utils.json_to_sheet(logs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Log Emails');
    XLSX.writeFile(wb, `log_emails_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Inicializar serviço de notificações
const notificationService = new NotificationService();

// Solicitar permissão ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        notificationService.solicitarPermissaoBrowser();
        notificationService.carregarNotificacoes();
    }, 1000);
});