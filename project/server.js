import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite e Create React App
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do transporter do nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'screletronicaind@gmail.com',
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Rota para enviar email
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validação básica
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    const transporter = createTransporter();

    // Configuração do email
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER || 'screletronicaind@gmail.com',
      to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
      subject: `Novo contato via site - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #0891b2); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SCR Eletrônica Industrial</h1>
            <p style="color: #e0f2fe; margin: 5px 0 0 0;">Novo contato via formulário do site</p>
          </div>
          
          <div style="padding: 30px; background-color: #f8fafc; border-left: 4px solid #1e3a8a;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Dados do Contato</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong style="color: #374151;">Nome:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong style="color: #374151;">Email:</strong> 
                <a href="mailto:${email}" style="color: #1e3a8a;">${email}</a>
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Mensagem:</h3>
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 3px solid #1e3a8a;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', {
                  timeZone: 'America/Recife',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              Este email foi enviado automaticamente via formulário do site SCR Eletrônica Industrial
            </p>
          </div>
        </div>
      `,
      // Versão texto simples como fallback
      text: `
        Novo contato via site SCR Eletrônica Industrial
        
        Nome: ${name}
        Email: ${email}
        
        Mensagem:
        ${message}
        
        Data/Hora: ${new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Recife'
        })}
      `
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado com sucesso:', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Email enviado com sucesso!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    // Diferentes tipos de erro
    let errorMessage = 'Erro interno do servidor';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erro de autenticação do email. Verifique as credenciais.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Erro de conexão. Tente novamente em alguns minutos.';
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Erro na formatação da mensagem.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SCR Email Service',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📧 Serviço de email configurado para: screletronicaind@gmail.com`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/test`);
});

export default app;