import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const whatsappNumber = '5581999266729'; // Brazil country code + number
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da SCR Eletrônica Industrial.');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppClick = () => {
    // Create a more detailed message for contact form
    const detailedMessage = encodeURIComponent(
      'Olá! Vim através do formulário de contato do site da SCR.\n\n' +
      'Gostaria de solicitar:\n' +
      '• Orçamento detalhado\n' +
      '• Informações sobre prazos\n' +
      '• Agendamento de visita técnica\n\n' +
      'Dados para contato:\n' +
      '• Nome: [Informar]\n' +
      '• Empresa: [Informar]\n' +
      '• Tipo de equipamento: [Informar]\n\n' +
      'Aguardo retorno para darmos continuidade!'
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${detailedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validação básica no frontend
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Verificar se o backend está rodando primeiro
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Enviar dados para o backend com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      const response = await fetch(`${backendUrl}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          phone: '(00) 00000-0000', // Campo obrigatório no backend
          email: formData.email,
          subject: 'Contato via formulário do site',
          category: 'duvida',
          message: formData.message
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erro ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        throw new Error(result.message || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      
      let userFriendlyMessage = '';
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          userFriendlyMessage = 'Timeout: O servidor demorou muito para responder. Tente novamente.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('fetch')) {
          userFriendlyMessage = 'Erro de conexão. Verifique se o servidor está rodando: npm run server';
        } else {
          userFriendlyMessage = error.message;
        }
      } else {
        userFriendlyMessage = 'Erro de conexão com o servidor. Execute: npm run dev:server';
      }
      
      setErrorMessage(userFriendlyMessage);
      
      // Reset error message after 10 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Estamos prontos para atender suas necessidades em eletrônica industrial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Telefone</p>
                  <p className="text-gray-700">(81) 99926-6729</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">E-mail</p>
                  <p className="text-gray-700">screletronicaind@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Endereço</p>
                  <p className="text-gray-700">AV. Afonso Olindense 216, sala 02<br />Várzea, PE - 50810-000</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact Button */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Fale Conosco no WhatsApp</h3>
                  <p className="text-green-100">Atendimento rápido e direto</p>
                </div>
              </div>
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-white text-green-600 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Conversar no WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <p className="font-semibold">✅ Mensagem enviada com sucesso!</p>
                <p className="text-sm">Recebemos sua mensagem e entraremos em contato em breve.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">❌ Erro ao enviar mensagem</p>
                <p className="text-sm">{errorMessage}</p>
                <div className="text-xs mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <p className="font-semibold mb-2">💡 Como resolver:</p>
                  <p className="mb-1">1. Abra um novo terminal</p>
                  <p className="mb-1">2. Execute: <code className="bg-red-200 px-1 rounded font-mono">npm run server</code></p>
                  <p className="mb-1">3. Ou execute tudo junto: <code className="bg-red-200 px-1 rounded font-mono">npm run dev:full</code></p>
                  <p>4. Aguarde a mensagem "🚀 Servidor rodando na porta 5000"</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Seu nome *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Digite seu nome completo"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Seu email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Sua mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Descreva como podemos ajudá-lo..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;