import nodemailer from 'nodemailer';

// Configuração do transporter do nodemailer
export const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER || 'screletronicaind@gmail.com',
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Função para sanitizar dados
export const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Função para criar template HTML para emails
export const createEmailTemplate = (title, content, type = 'default') => {
  const colors = {
    repair: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1e40af' },
    message: { primary: '#059669', secondary: '#d1fae5', accent: '#047857' },
    default: { primary: '#1e3a8a', secondary: '#dbeafe', accent: '#1e40af' }
  };

  const color = colors[type] || colors.default;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${color.primary}, ${color.accent}); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">SCR Eletrônica Industrial</h1>
          <p style="color: ${color.secondary}; margin: 10px 0 0 0; font-size: 16px;">${title}</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 40px; border-left: 4px solid ${color.primary};">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; padding: 25px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            SCR Eletrônica Industrial<br>
            AV. Afonso Olindense 216, sala 02 - Várzea, PE - 50810-000<br>
            Telefone: (81) 99926-6729 | Email: screletronicaind@gmail.com
          </p>
          <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
            Este email foi enviado automaticamente via formulário do site
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};