import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Sobre a SCR
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          A SCR é uma empresa especializada em eletrônica industrial com mais de 16 anos
          de experiência no mercado. Oferecemos soluções completas,
          manutenção e instalação de sistemas eletrônicos industriais.
        </p>

        <p className="text-lg text-gray-600 leading-relaxed">
          Nossa equipe técnica qualificada está pronta para atender suas necessidades 
          com qualidade e eficiência.
        </p>
      </div>
    </section>
  );
};

export default About;