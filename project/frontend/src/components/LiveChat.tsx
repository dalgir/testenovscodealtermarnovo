import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Minimize2, Maximize2, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'whatsapp-transfer' | 'quick-reply';
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou o assistente virtual da SCR Eletrônica Industrial. Como posso ajudá-lo hoje?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = '5581999266729';

  const quickReplies = [
    "Solicitar orçamento",
    "Horário de funcionamento", 
    "Tipos de reparo",
    "Localização",
    "Falar com técnico",
    "Emergência 24h"
  ];

  const botResponses: { [key: string]: string } = {
    "solicitar orçamento": "Para um orçamento personalizado, posso transferir você diretamente para nosso WhatsApp ou você pode usar nossa calculadora online. Qual prefere?",
    "horário de funcionamento": "Nosso horário de funcionamento é:\n• Segunda a Sexta: 08:00 às 18:00\n• Sábado: 08:00 às 12:00\n• Domingo: Fechado\n\nPara emergências, temos atendimento 24h via WhatsApp!",
    "tipos de reparo": "Realizamos reparos em:\n• Inversores de frequência\n• Placas eletrônicas industriais\n• Servo motores e drives\n• Fontes de alimentação\n• Soft starters\n• Módulos eletrônicos\n\nQuer falar com um técnico especializado?",
    "localização": "Estamos localizados na AV. Afonso Olindense 216, sala 02, Várzea, Recife - PE, CEP: 50810-000. Atendemos toda a região metropolitana do Recife.\n\nPosso enviar a localização pelo WhatsApp se desejar!",
    "falar com técnico": "Vou conectar você com um de nossos técnicos especializados via WhatsApp. Preciso de algumas informações primeiro.",
    "emergência 24h": "Para emergências, temos atendimento 24h! Vou transferir você imediatamente para nosso WhatsApp de emergência.",
    "whatsapp": "Perfeito! Vou transferir nossa conversa para o WhatsApp. Você será redirecionado automaticamente.",
    "calculadora": "Nossa calculadora de orçamento está disponível na página principal. Mas posso ajudar você com uma estimativa rápida aqui mesmo!"
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(messageText.toLowerCase());
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        type: botResponse.type
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Handle special actions
      if (botResponse.action) {
        setTimeout(() => {
          botResponse.action!();
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const getBotResponse = (userMessage: string): { text: string; type?: string; action?: () => void } => {
    // Check for WhatsApp transfer requests
    if (userMessage.includes('whatsapp') || userMessage.includes('técnico') || userMessage.includes('emergência')) {
      if (userMessage.includes('emergência')) {
        return {
          text: "🚨 Emergência detectada! Vou transferir você imediatamente para nosso atendimento 24h no WhatsApp.",
          type: 'whatsapp-transfer',
          action: () => transferToWhatsApp('EMERGÊNCIA: Preciso de atendimento urgente!')
        };
      }
      
      return {
        text: "Vou conectar você com nossa equipe técnica via WhatsApp. Isso permitirá um atendimento mais personalizado e você poderá enviar fotos do equipamento.",
        type: 'whatsapp-transfer',
        action: () => setShowContactForm(true)
      };
    }

    // Check for calculator request
    if (userMessage.includes('calculadora') || userMessage.includes('orçamento')) {
      return {
        text: "Posso ajudar com o orçamento! Você prefere:\n1️⃣ Usar nossa calculadora online\n2️⃣ Falar diretamente no WhatsApp\n3️⃣ Fazer uma estimativa rápida aqui",
        type: 'quick-reply'
      };
    }

    // Standard responses
    for (const [key, response] of Object.entries(botResponses)) {
      if (userMessage.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(userMessage)) {
        return { text: response };
      }
    }

    // Context-aware responses
    if (userMessage.includes('preço') || userMessage.includes('valor') || userMessage.includes('custo')) {
      return {
        text: "Os preços variam conforme o equipamento e complexidade. Para um orçamento preciso, posso transferir você para nosso WhatsApp onde nossos técnicos farão uma avaliação detalhada.",
        type: 'whatsapp-transfer',
        action: () => setShowContactForm(true)
      };
    }
    
    if (userMessage.includes('prazo') || userMessage.includes('tempo') || userMessage.includes('demora')) {
      return {
        text: "Nossos prazos são:\n• Normal: 5-7 dias\n• Urgente: 2-3 dias\n• Emergência: 24 horas\n\nPara confirmar o prazo do seu caso específico, posso conectar você com um técnico via WhatsApp.",
        action: () => setTimeout(() => setShowContactForm(true), 3000)
      };
    }
    
    if (userMessage.includes('garantia')) {
      return {
        text: "Oferecemos garantia de 90 dias em todos os reparos! A garantia cobre defeitos relacionados ao serviço realizado. Quer saber mais detalhes via WhatsApp?"
      };
    }

    // Default response with WhatsApp option
    return {
      text: "Entendi! Para um atendimento mais detalhado e personalizado, recomendo continuar nossa conversa no WhatsApp. Posso transferir você agora mesmo!",
      action: () => setTimeout(() => setShowContactForm(true), 2000)
    };
  };

  const transferToWhatsApp = (customMessage?: string) => {
    const conversationHistory = messages
      .slice(-5) // Last 5 messages
      .map(msg => `${msg.sender === 'user' ? 'Cliente' : 'Assistente'}: ${msg.text}`)
      .join('\n');

    const whatsappMessage = encodeURIComponent(
      customMessage || 
      `Olá! Vim do chat do site da SCR Eletrônica Industrial.\n\n` +
      `Histórico da conversa:\n${conversationHistory}\n\n` +
      `${userName ? `Nome: ${userName}\n` : ''}` +
      `${userPhone ? `Telefone: ${userPhone}\n` : ''}` +
      `Gostaria de continuar o atendimento aqui no WhatsApp.`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now(),
      text: "✅ Redirecionando para WhatsApp... Se não abriu automaticamente, clique no link acima!",
      sender: 'bot',
      timestamp: new Date(),
      type: 'whatsapp-transfer'
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setShowContactForm(false);
    
    const welcomeMessage: Message = {
      id: Date.now(),
      text: `Perfeito, ${userName}! Agora vou transferir você para nosso WhatsApp para um atendimento personalizado.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);

    setTimeout(() => {
      transferToWhatsApp();
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95"
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-7 w-7" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">1</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistente SCR</h3>
            <p className="text-xs text-blue-200">Online • Conecta com WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            aria-label={isMinimized ? "Maximizar chat" : "Minimizar chat"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-800 rounded transition-colors"
            aria-label="Fechar chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Contact Form Modal */}
          {showContactForm && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl z-10 p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Conectar com WhatsApp
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Para um atendimento mais personalizado
                </p>
              </div>

              <form onSubmit={handleContactFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seu nome *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Como posso te chamar?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="(81) 99999-9999"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Conectar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-900 text-white'
                    : message.type === 'whatsapp-transfer'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-900 dark:text-blue-400" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-200" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      
                      {/* WhatsApp Transfer Button */}
                      {message.type === 'whatsapp-transfer' && (
                        <button
                          onClick={() => transferToWhatsApp()}
                          className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Abrir WhatsApp
                        </button>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-900 dark:text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-1">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(reply)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Button */}
          <div className="px-4 pb-2">
            <button
              onClick={() => transferToWhatsApp('Olá! Gostaria de falar diretamente com a equipe da SCR.')}
              className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ir direto para WhatsApp
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChat;