import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

const Hero = () => {
  const whatsappNumber = '5581999266729';
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da SCR Eletrônica Industrial.');

  const handleWhatsAppClick = () => {
    // Enhanced message for hero section
    const heroMessage = encodeURIComponent(
      'Olá SCR Eletrônica Industrial! 👋\n\n' +
      'Vim através do site de vocês e gostaria de conhecer melhor os serviços.\n\n' +
      'Tenho interesse em:\n' +
      '• Manutenção de equipamentos industriais\n' +
      '• Reparo de inversores e placas eletrônicas\n' +
      '• Consultoria técnica especializada\n\n' +
      'Podem me enviar mais informações?\n\n' +
      'Obrigado!'
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${heroMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url("/scr-background-subtle.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content with higher z-index */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          SCR
          <span className="block text-blue-900">Eletrônica Industrial</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
         
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={scrollToContact}
            className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-300 flex items-center"
          >
            Entre em Contato
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </button>
          
          <button 
            onClick={handleWhatsAppClick}
            className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;