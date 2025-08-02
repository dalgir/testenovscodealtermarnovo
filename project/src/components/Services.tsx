import React from 'react';
import { Settings, Wrench } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Settings,
      title: "Manutenção",
      description: "Manutenção preventiva e corretiva de equipamentos"
    },
    {
      icon: Wrench,
      title: "Instalação",
      description: "Instalação e configuração de sistemas eletrônicos"
    }
  ];

  // Updated company logos with the new uploaded images
  const companyLogos = [
    {
      name: "Rockwell Automation",
      logo: "/Rockwell_Automation (1).webp"
    },
    {
      name: "Schneider Electric",
      logo: "/schneider (1).webp"
    },
    {
      name: "SEW Eurodrive",
      logo: "/SEW.webp"
    },
    {
      name: "Siemens",
      logo: "/Siemens.webp"
    },
    {
      name: "Bosch",
      logo: "/bosch.webp"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nossos Serviços
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className="text-center p-6">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Seção de Parceiros/Marcas */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trabalhamos com as Melhores Marcas
            </h3>
            <p className="text-gray-600">
              Parceiros de confiança em inversores e equipamentos eletrônicos
            </p>
          </div>

          {/* Carrossel de Logos */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-12 items-center">
              {/* Primeira sequência */}
              {companyLogos.map((company, index) => (
                <div key={index} className="flex-shrink-0 w-52 h-32 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 p-6">
                  <img
                    src={company.logo}
                    alt={`${company.name} - Parceiro em equipamentos eletrônicos industriais`}
                    className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                    style={{ 
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      imageRendering: 'crisp-edges'
                    }}
                    loading="lazy"
                    onError={(e) => {
                      console.log(`Erro ao carregar logo: ${company.name}`);
                      // Fallback para uma imagem placeholder ou esconder
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
              {/* Segunda sequência para loop contínuo */}
              {companyLogos.map((company, index) => (
                <div key={`duplicate-${index}`} className="flex-shrink-0 w-52 h-32 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 p-6">
                  <img
                    src={company.logo}
                    alt={`${company.name} - Parceiro em equipamentos eletrônicos industriais`}
                    className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                    style={{ 
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      imageRendering: 'crisp-edges'
                    }}
                    loading="lazy"
                    onError={(e) => {
                      console.log(`Erro ao carregar logo: ${company.name}`);
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Services;