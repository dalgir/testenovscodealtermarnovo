import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';

const WhatsAppFloat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = '5581999266729'; // Brazil country code + number
  const whatsappMessage = encodeURIComponent(
    'Olá! Vim do site da SCR Eletrônica Industrial.\n\n' +
    'Gostaria de saber mais sobre os serviços de eletrônica industrial.\n\n' +
    'Podem me ajudar com:\n' +
    '• Orçamento personalizado\n' +
    '• Informações técnicas\n' +
    '• Agendamento de visita\n\n' +
    'Aguardo retorno!'
  );

  // Show the button after a short delay when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show tooltip after button appears
  useEffect(() => {
    if (isVisible) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        // Hide tooltip after 5 seconds
        setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
      }, 2000);

      return () => clearTimeout(tooltipTimer);
    }
  }, [isVisible]);

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Track interaction (could be used for analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'floating_button'
      });
    }
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-20 right-0 mb-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 transform transition-all duration-300 animate-bounce">
          <button
            onClick={handleTooltipClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar dica"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Atendimento Especializado
              </p>
              <p className="text-xs text-gray-600">
                Nossa equipe técnica está online para ajudar você!
              </p>
            </div>
          </div>
          
          {/* Quick action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                const emergencyMessage = encodeURIComponent(
                  '🚨 EMERGÊNCIA - Preciso de atendimento urgente!\n\n' +
                  'Equipamento parado, preciso de suporte técnico imediato.'
                );
                window.open(`https://wa.me/${whatsappNumber}?text=${emergencyMessage}`, '_blank');
                setShowTooltip(false);
              }}
              className="w-full bg-red-500 text-white py-2 px-3 rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              🚨 Emergência 24h
            </button>
            <button
              onClick={() => {
                handleWhatsAppClick();
                setShowTooltip(false);
              }}
              className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              💬 Conversar Agora
            </button>
          </div>
          
          {/* Arrow pointing to button */}
          <div className="absolute bottom-0 right-8 transform translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="group relative w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95"
        aria-label="Conversar no WhatsApp"
      >
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></div>
        <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-40"></div>
        
        {/* Icon */}
        <MessageCircle className="h-8 w-8 relative z-10" />
        
        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Status label */}
      <div className="absolute -top-8 right-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-90">
        Online
      </div>
    </div>
  );
};

export default WhatsAppFloat;