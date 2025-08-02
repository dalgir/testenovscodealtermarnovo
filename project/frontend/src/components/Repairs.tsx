import React, { useState, useEffect } from 'react';
import { Wrench, Cpu, Zap, Shield, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import RepairRequestForm from './RepairRequestForm';

const Repairs = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const repairServices = [
    {
      icon: Cpu,
      title: "Reparo de Placas Eletrônicas",
      description: "Conserto especializado em placas eletrônicas industriais"
    },
    {
      icon: Zap,
      title: "Manutenção de Inversores",
      description: "Manutenção de inversores de frequência multimarcas"
    },
    {
      icon: Wrench,
      title: "Assistência Técnica",
      description: "Assistência técnica especializada em equipamentos industriais"
    },
    {
      icon: Shield,
      title: "Garantia em Todos os Serviços",
      description: "Garantia técnica completa em todos os nossos serviços"
    }
  ];

  // Product components with actual uploaded images
  const productComponents = [
    {
      title: "Servo Motores e Drives",
      description: "Servo motores de alta precisão e drives de controle para automação industrial",
      image: "/servo (1).webp",
      category: "Servo Systems",
      features: ["Alta precisão", "Controle avançado", "Baixa manutenção"]
    },
    {
      title: "Fontes de Alimentação",
      description: "Fontes industriais robustas para sistemas de automação e controle",
      image: "/fonte.webp",
      category: "Power Supply",
      features: ["Alta eficiência", "Proteção integrada", "Design compacto"]
    },
    {
      title: "Soft Starters",
      description: "Chaves de partida suave para motores elétricos industriais",
      image: "/softstart.webp",
      category: "Motor Control",
      features: ["Partida suave", "Proteção térmica", "Interface intuitiva"]
    },
    {
      title: "Módulos Eletrônicos",
      description: "Placas e módulos eletrônicos para controle e automação industrial",
      image: "/modulo (2).webp",
      category: "Control Modules",
      features: ["Tecnologia avançada", "Conectividade", "Programável"]
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % productComponents.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, productComponents.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % productComponents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + productComponents.length) % productComponents.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="repairs" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Serviços de Manutenção e Reparo Especializado
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Oferecemos serviços profissionais de:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="text-lg text-gray-700">Reparo de placas eletrônicas industriais</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="text-lg text-gray-700">Manutenção de inversores de frequência</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="text-lg text-gray-700">Assistência técnica especializada</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="text-lg text-gray-700">Garantia em todos os serviços</span>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Entre em contato para um diagnóstico personalizado
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-300 text-lg"
            >
              SOLICITAR REPARO
            </button>
          </div>
        </div>

        {/* Serviços de Reparo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {repairServices.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                {service.title}
              </h3>
              
              <p className="text-gray-600 text-center text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Enhanced Product Components Carousel */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Componentes e Peças Especializadas
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trabalhamos com componentes de alta qualidade das principais marcas do mercado
            </p>
          </div>

          {/* Main Carousel */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="relative h-96 md:h-[500px]">
              {productComponents.map((component, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide 
                      ? 'opacity-100 transform translate-x-0' 
                      : index < currentSlide 
                        ? 'opacity-0 transform -translate-x-full' 
                        : 'opacity-0 transform translate-x-full'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    {/* Image Section */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
                      <div className="relative w-full h-full max-w-md mx-auto">
                        <img
                          src={component.image}
                          alt={component.title}
                          className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = "https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800";
                          }}
                        />
                        <div className="absolute -top-4 -right-4 bg-blue-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {component.category}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-center p-8 lg:p-12 bg-white">
                      <div className="max-w-lg">
                        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                          {component.title}
                        </h4>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          {component.description}
                        </p>
                        
                        {/* Features */}
                        <div className="mb-8">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                            Características Principais
                          </h5>
                          <div className="space-y-2">
                            {component.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <button 
                          onClick={() => setIsFormOpen(true)}
                          className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-300 inline-flex items-center"
                        >
                          Solicitar Orçamento
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {productComponents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-900 scale-125' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Auto-play indicator */}
            <div className="absolute top-4 right-4">
              <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {productComponents.map((component, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 p-4 ${
                  index === currentSlide ? 'ring-2 ring-blue-900 scale-105' : 'hover:scale-102'
                }`}
              >
                <div className="aspect-square mb-3">
                  <img
                    src={component.image}
                    alt={component.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h5 className="text-sm font-semibold text-gray-900 text-center">
                  {component.title}
                </h5>
              </button>
            ))}
          </div>

          {/* Informações Adicionais */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Garantia de Qualidade</h4>
                <p className="text-gray-600">Todos os reparos com garantia técnica de 90 dias</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Atendimento Rápido</h4>
                <p className="text-gray-600">Diagnóstico e orçamento em até 24 horas</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Tecnologia Avançada</h4>
                <p className="text-gray-600">Equipamentos modernos de teste e bancada</p>
              </div>
            </div>
          </div>

          {/* Call to Action Final */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-900 to-cyan-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Diagnóstico Personalizado Gratuito
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Nossa equipe técnica especializada está pronta para avaliar seus equipamentos
              </p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 text-lg"
              >
                SOLICITAR REPARO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Formulário */}
      <RepairRequestForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </section>
  );
};

export default Repairs;