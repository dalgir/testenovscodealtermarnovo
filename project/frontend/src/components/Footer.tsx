import React from 'react';
import { Zap, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">SCR</span>
        </div>
        
        <p className="text-gray-400 mb-6">
          Eletrônica Industrial
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-6">
          <a 
            href="#" 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors duration-300"
          >
            <Facebook className="h-5 w-5 text-white" />
          </a>
          <a 
            href="https://www.instagram.com/scr.eletronica/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors duration-300"
          >
            <Instagram className="h-5 w-5 text-white" />
          </a>
          <a 
            href="#" 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors duration-300"
          >
            <Linkedin className="h-5 w-5 text-white" />
          </a>
        </div>
        
        <p className="text-gray-500 text-sm">
          © 2024 SCR. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;