import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'SCR Eletrônica Industrial - Manutenção e Reparo de Equipamentos Industriais',
  description = 'Especialistas em manutenção e reparo de equipamentos eletrônicos industriais. Inversores, placas eletrônicas, servo motores e mais. Atendimento em Pernambuco.',
  keywords = 'eletrônica industrial, reparo de inversores, manutenção industrial, placas eletrônicas, servo motores, automação industrial, Pernambuco, Recife',
  image = '/og-image.jpg',
  url = 'https://screletronica.com.br',
  type = 'website'
}) => {
  const fullTitle = title.includes('SCR') ? title : `${title} | SCR Eletrônica Industrial`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="SCR Eletrônica Industrial" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="SCR Eletrônica Industrial" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1e3a8a" />
      <meta name="msapplication-TileColor" content="#1e3a8a" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "SCR Eletrônica Industrial",
          "description": description,
          "url": url,
          "telephone": "+55-81-99926-6729",
          "email": "screletronicaind@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "AV. Afonso Olindense 216, sala 02",
            "addressLocality": "Várzea",
            "addressRegion": "PE",
            "postalCode": "50810-000",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-8.0476",
            "longitude": "-34.8770"
          },
          "openingHours": "Mo-Fr 08:00-18:00",
          "priceRange": "$$",
          "serviceArea": {
            "@type": "State",
            "name": "Pernambuco"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços de Eletrônica Industrial",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Reparo de Inversores de Frequência"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Manutenção de Placas Eletrônicas"
                }
              }
            ]
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;