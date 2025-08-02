import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Repairs from './components/Repairs';
import About from './components/About';
import Testimonials from './components/Testimonials';
import LocationContact from './components/LocationContact';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import LiveChat from './components/LiveChat';
import CustomerServiceForms from './components/CustomerServiceForms';
import SEOHead from './components/SEOHead';

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors duration-300">
        <SEOHead />
        
        {/* Background Image with Low Opacity */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat dark:opacity-20"
          style={{
            backgroundImage: 'url("/WhatsApp Image 2025-07-02 at 03.28.34 (2).jpeg")',
            opacity: 0.03,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Content with higher z-index */}
        <div className="relative z-10">
          <Header />
          <Hero />
          <Services />
          <Repairs />
          <About />
          <Testimonials />
          <LocationContact />
          <CustomerServiceForms />
          <Contact />
          <Footer />
          <WhatsAppFloat />
          <LiveChat />
        </div>
      </div>
    </HelmetProvider>
  );
}

export default App;