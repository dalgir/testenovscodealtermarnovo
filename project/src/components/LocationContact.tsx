import React from 'react';
import { MapPin, Clock, Navigation, Car } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const LocationContact = () => {
  const companyInfo = {
    name: "SCR Eletrônica Industrial",
    address: "AV. Afonso Olindense 216, sala 02",
    neighborhood: "Várzea",
    city: "Recife",
    state: "PE",
    zipCode: "50810-000",
    phone: "(81) 99926-6729",
    email: "screletronicaind@gmail.com"
  };

  const businessHours = [
    { day: "Segunda a Sexta", hours: "08:00 - 18:00" },
    { day: "Sábado", hours: "08:00 - 12:00" },
    { day: "Domingo", hours: "Fechado" }
  ];

  const handleViewOnMap = () => {
    const query = encodeURIComponent(`${companyInfo.name}, ${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleGetDirections = () => {
    const destination = encodeURIComponent(`${companyInfo.address}, ${companyInfo.neighborhood}, ${companyInfo.city}, ${companyInfo.state}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <section id="location-contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Nossa Localização
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visite nossa sede em Recife ou entre em contato para atendimento em sua empresa
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          {/* Map Section */}
          <AnimatedSection animation="slideUp" className="relative mb-12">
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden">
              {/* Interactive Map Placeholder */}
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-blue-900 dark:text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {companyInfo.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {companyInfo.address}<br />
                      {companyInfo.neighborhood}, {companyInfo.city} - {companyInfo.state}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleViewOnMap}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Ver no Mapa
                      </button>
                      <button
                        onClick={handleGetDirections}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Como Chegar
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-8 w-4 h-4 bg-yellow-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </AnimatedSection>

          {/* Business Hours */}
          <AnimatedSection animation="slideUp" className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-orange-900 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Horário de Funcionamento
              </h3>
            </div>
            
            <div className="space-y-3">
              {businessHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {schedule.day}
                  </span>
                  <span className={`font-semibold ${
                    schedule.hours === 'Fechado' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Service Area */}
        <AnimatedSection animation="slideUp" delay={0.3} className="mt-16">
          <div className="text-center mb-16">
            <div className="bg-gradient-to-r from-blue-900 to-cyan-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Área de Atendimento</h3>
              <p className="text-lg mb-6 opacity-90">
                Atendemos toda a Região Metropolitana do Recife e interior de Pernambuco
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="font-semibold">Recife</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="font-semibold">Olinda</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="font-semibold">Jaboatão</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="font-semibold">Caruaru</span>
                </div>
              </div>
              <p className="text-sm mt-4 opacity-75">
                Para outras localidades, consulte disponibilidade
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default LocationContact;