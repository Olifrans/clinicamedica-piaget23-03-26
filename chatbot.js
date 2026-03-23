// ==================== CHATBOT IA MODULE ====================
class ChatbotIA {
    constructor() {
        this.contexto = {};
        this.historico = [];
        this.intencoes = {
            'agendar_consulta': ['agendar', 'marcar', 'consulta', 'horário', 'agendamento'],
            'cancelar_consulta': ['cancelar', 'desmarcar', 'cancelamento'],
            'informacoes_medico': ['médico', 'doutor', 'especialidade', 'horário atendimento'],
            'informacoes_paciente': ['paciente', 'cadastro', 'dados'],
            'horarios_disponiveis': ['horário', 'disponível', 'vaga', 'quando'],
            'precos': ['preço', 'valor', 'custo', 'quanto custa'],
            'localizacao': ['endereço', 'local', 'onde fica', 'chegar'],
            'documentos': ['documento', 'rg', 'cpf', 'carteirinha']
        };
        
        this.respostas = {
            'agendar_consulta': this.respostaAgendamento.bind(this),
            'cancelar_consulta': this.respostaCancelamento.bind(this),
            'informacoes_medico': this.respostaInfoMedico.bind(this),
            'horarios_disponiveis': this.respostaHorarios.bind(this),
            'precos': this.respostaPrecos.bind(this),
            'localizacao': this.respostaLocalizacao.bind(this),
            'documentos': this.respostaDocumentos.bind(this),
            'default': this.respostaDefault.bind(this)
        };
    }
    
    processarMensagem(mensagem) {
        const mensagemLower = mensagem.toLowerCase();
        const intencao = this.analisarIntencao(mensagemLower);
        
        this.historico.push({
            timestamp: new Date(),
            mensagem: mensagem,
            intencao: intencao
        });
        
        const resposta = this.gerarResposta(intencao, mensagemLower);
        
        return {
            texto: resposta,
            intencao: intencao,
            sugestoes: this.gerarSugestoes(intencao)
        };
    }
    
    analisarIntencao(mensagem) {
        for (let [intencao, palavras] of Object.entries(this.intencoes)) {
            for (let palavra of palavras) {
                if (mensagem.includes(palavra)) {
                    return intencao;
                }
            }
        }
        return 'default';
    }
    
    gerarResposta(intencao, mensagem) {
        const funcaoResposta = this.respostas[intencao] || this.respostas.default;
        return funcaoResposta(mensagem);
    }
    
    respostaAgendamento(mensagem) {
        if (mensagem.includes('hoje') || mensagem.includes('agora')) {
            return "Entendo que você quer agendar uma consulta para hoje. Vou verificar a disponibilidade...\n\n" +
                   "📅 Horários disponíveis para hoje:\n" +
                   "• 09:00 - Dr. Silva (Clínico Geral)\n" +
                   "• 14:30 - Dra. Santos (Cardiologia)\n" +
                   "• 16:00 - Dr. Oliveira (Dermatologia)\n\n" +
                   "Qual horário você prefere? Posso agendar para você!";
        } else {
            return "Para agendar uma consulta, preciso de algumas informações:\n\n" +
                   "1️⃣ Qual especialidade médica você precisa?\n" +
                   "2️⃣ Qual dia e horário prefere?\n" +
                   "3️⃣ Qual o nome do paciente?\n\n" +
                   "Você pode me informar esses dados ou acessar a aba 'Consultas' para agendar diretamente.";
        }
    }
    
    respostaCancelamento(mensagem) {
        const consultasHoje = consultas.filter(c => 
            c.status === 'AGENDADA' && 
            new Date(c.dataHora).toDateString() === new Date().toDateString()
        );
        
        if (consultasHoje.length > 0) {
            return "⚠️ Você possui consultas agendadas para hoje:\n\n" +
                   consultasHoje.map(c => {
                       const paciente = pacientes.find(p => p.id == c.pacienteId);
                       return `• ${paciente?.nome} às ${new Date(c.dataHora).toLocaleTimeString()}`;
                   }).join('\n') +
                   "\n\nPara cancelar, acesse a aba 'Consultas' e clique no botão de cancelar.\n" +
                   "⏰ Lembre-se: cancelamentos com menos de 2h de antecedência podem ter taxa.";
        } else {
            return "Para cancelar uma consulta:\n\n" +
                   "1. Acesse a aba 'Consultas'\n" +
                   "2. Localize a consulta desejada\n" +
                   "3. Clique no botão vermelho (✗) para cancelar\n\n" +
                   "Precisa de ajuda para localizar a consulta?";
        }
    }
    
    respostaInfoMedico(mensagem) {
        const especialidades = [...new Set(medicos.map(m => m.especialidade))];
        
        if (mensagem.match(/(cardiologista|cardio|cardiologia)/i)) {
            const cardio = medicos.filter(m => m.especialidade.toLowerCase().includes('cardio'));
            if (cardio.length > 0) {
                return "👨‍⚕️ Cardiologistas disponíveis:\n\n" +
                       cardio.map(m => `• ${m.nome} - CRM: ${m.crm}\n  Agendamentos: verifique disponibilidade na aba Consultas`).join('\n\n');
            }
        } else if (mensagem.match(/(dermatologista|dermato|pele)/i)) {
            const dermato = medicos.filter(m => m.especialidade.toLowerCase().includes('dermato'));
            if (dermato.length > 0) {
                return "👨‍⚕️ Dermatologistas disponíveis:\n\n" +
                       dermato.map(m => `• ${m.nome} - CRM: ${m.crm}`).join('\n\n');
            }
        }
        
        return "👨‍⚕️ Especialidades disponíveis:\n\n" +
               especialidades.map(esp => `• ${esp}`).join('\n') +
               "\n\nQual especialidade você gostaria de conhecer? Posso mostrar os médicos disponíveis.";
    }
    
    respostaHorarios(mensagem) {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        const consultasHoje = consultas.filter(c => 
            new Date(c.dataHora).toDateString() === hoje.toDateString()
        );
        
        return "📅 Horários de funcionamento:\n\n" +
               "Segunda a Sexta: 08:00 às 18:00\n" +
               "Sábado: 08:00 às 12:00\n" +
               "Domingo: Fechado\n\n" +
               `Hoje (${hoje.toLocaleDateString()}) temos ${consultasHoje.length} consultas agendadas.\n` +
               "Para ver horários disponíveis, acesse a aba 'Consultas' e clique em 'Nova Consulta'.";
    }
    
    respostaPrecos(mensagem) {
        return "💰 Valores das consultas:\n\n" +
               "• Consulta particular: R$ 250,00\n" +
               "• Consulta com plano de saúde: R$ 50,00 (coparticipação)\n" +
               "• Retorno: R$ 150,00\n\n" +
               "📞 Aceitamos todos os cartões de crédito e débito.\n" +
               "⚠️ Planos aceitos: Unimed, Bradesco Saúde, Amil, SulAmérica.\n\n" +
               "Gostaria de verificar se seu plano é aceito?";
    }
    
    respostaLocalizacao(mensagem) {
        return "📍 Nossa localização:\n\n" +
               "Clínica Saúde Total\n" +
               "Av. Paulista, 1000 - Bela Vista\n" +
               "São Paulo - SP, 01310-100\n\n" +
               "🚇 Metrô mais próximo: Estação Trianon-Masp (Linha 2 - Verde)\n" +
               "🚌 Ônibus: Linhas 175P-10, 175T-10, 177H-10\n" +
               "🚗 Estacionamento conveniado: R$ 15,00 por 2h\n\n" +
               "Precisa de ajuda para planejar sua rota?";
    }
    
    respostaDocumentos(mensagem) {
        return "📋 Documentos necessários para consulta:\n\n" +
               "• Documento com foto (RG ou CNH)\n" +
               "• CPF\n" +
               "• Carteirinha do plano de saúde (se aplicável)\n" +
               "• Exames anteriores relacionados à consulta\n" +
               "• Receitas ou encaminhamentos (se houver)\n\n" +
               "⚠️ Pacientes menores de idade devem estar acompanhados dos pais ou responsáveis legais.";
    }
    
    respostaDefault(mensagem) {
        const sugestoes = [
            "Agendar consulta",
            "Ver horários",
            "Valores das consultas",
            "Localização",
            "Documentos necessários"
        ];
        
        return "Desculpe, não entendi completamente sua pergunta.\n\n" +
               "💡 Posso ajudar com:\n" +
               sugestoes.map(s => `• ${s}`).join('\n') +
               "\n\nOu você pode acessar o menu principal para mais opções.";
    }
    
    gerarSugestoes(intencao) {
        const sugestoesPorIntencao = {
            'agendar_consulta': ['Agendar para hoje', 'Agendar para amanhã', 'Ver especialidades'],
            'cancelar_consulta': ['Cancelar consulta de hoje', 'Cancelar consulta futura'],
            'informacoes_medico': ['Cardiologista', 'Dermatologista', 'Pediatra'],
            'horarios_disponiveis': ['Horários de hoje', 'Horários de amanhã'],
            'precos': ['Valor particular', 'Valor plano de saúde'],
            'localizacao': ['Como chegar', 'Estacionamento', 'Transporte público']
        };
        
        return sugestoesPorIntencao[intencao] || ['Agendar consulta', 'Ver horários', 'Valores'];
    }
}

// Inicialização do Chatbot
const chatbot = new ChatbotIA();

function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    window.classList.toggle('hidden');
}

function enviarMensagem() {
    const input = document.getElementById('chatInput');
    const mensagem = input.value.trim();
    
    if (!mensagem) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    // Adicionar mensagem do usuário
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = mensagem;
    chatMessages.appendChild(userMsg);
    
    input.value = '';
    
    // Processar resposta da IA
    const resposta = chatbot.processarMensagem(mensagem);
    
    // Adicionar resposta do bot
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerHTML = resposta.texto.replace(/\n/g, '<br>');
        chatMessages.appendChild(botMsg);
        
        // Adicionar sugestões se disponíveis
        if (resposta.sugestoes && resposta.sugestoes.length > 0) {
            const sugestoesDiv = document.createElement('div');
            sugestoesDiv.className = 'sugestoes';
            sugestoesDiv.innerHTML = '<strong>Sugestões:</strong><br>' + 
                resposta.sugestoes.map(s => `<span class="sugestao" onclick="enviarSugestao('${s}')">${s}</span>`).join(' ');
            chatMessages.appendChild(sugestoesDiv);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function enviarSugestao(sugestao) {
    document.getElementById('chatInput').value = sugestao;
    enviarMensagem();
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        enviarMensagem();
    }
}