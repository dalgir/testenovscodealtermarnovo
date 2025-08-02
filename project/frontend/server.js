const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Criar diretório de uploads se não existir
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `repair-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 5 // Máximo 5 arquivos
  },
  fileFilter: (req, file, cb) => {+
    // Apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 requests por IP por janela de tempo
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 envios por hora
  message: {
    success: false,
    message: 'Limite de envios atingido. Tente novamente em 1 hora.'
  }
});

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Aplicar rate limiting
app.use('/api/', limiter);

// Configuração do transporter do nodemailer
// Configuração do transporter (mantém como está acima)
const createTransporter = () => { ... };

// ⛔️ SUBSTITUA este trecho ⛔️
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      contactPreference,
      equipmentType,
      brandModel,
      serialNumber,
      purchaseDate,
      urgency,
      problemDescription,
      additionalNotes
    } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
      subject: `Nova Solicitação de Reparo - ${fullName}`,
      html: `
        <div>... (aqui vai o HTML com os dados do cliente)</div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Solicitação enviada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar o e-mail. Tente novamente mais tarde.'
    });
  }
});


// Validadores
const repairValidators = [
  body('fullName').trim().notEmpty().withMessage('Nome completo é obrigatório'),
  body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('equipmentType').notEmpty().withMessage('Tipo de equipamento é obrigatório'),
  body('problemDescription').trim().notEmpty().withMessage('Descrição do problema é obrigatória')
];

const messageValidators = [
  body('fullName').trim().notEmpty().withMessage('Nome completo é obrigatório'),
  body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('subject').trim().notEmpty().withMessage('Assunto é obrigatório'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('message').trim().notEmpty().withMessage('Mensagem é obrigatória')
];

// Função para sanitizar dados
const sanitizeData = (data) => {
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
const createEmailTemplate = (title, content, type = 'default') => {
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

// Rota para solicitação de reparo
app.post('/api/repair-request', strictLimiter, upload.array('images', 5), repairValidators, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Limpar arquivos enviados se houver erro de validação
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Erro ao deletar arquivo:', err);
          });
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const sanitizedData = sanitizeData(req.body);
    const files = req.files || [];

    // Log da requisição
    console.log(`[${new Date().toISOString()}] Nova solicitação de reparo de ${sanitizedData.fullName}`);

    const transporter = createTransporter();

    // Preparar anexos
    const attachments = files.map(file => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype
    }));

    // Conteúdo do email
    const emailContent = `
      <h2 style="color: #2563eb; margin-top: 0;">Nova Solicitação de Reparo</h2>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Dados do Cliente</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Nome:</td><td style="padding: 8px 0;">${sanitizedData.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Telefone:</td><td style="padding: 8px 0;">${sanitizedData.phone}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${sanitizedData.email}" style="color: #2563eb;">${sanitizedData.email}</a></td></tr>
        </table>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Dados do Equipamento</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Tipo:</td><td style="padding: 8px 0;">${sanitizedData.equipmentType}</td></tr>
          ${sanitizedData.brandModel ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Marca/Modelo:</td><td style="padding: 8px 0;">${sanitizedData.brandModel}</td></tr>` : ''}
          ${sanitizedData.serialNumber ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Número de Série:</td><td style="padding: 8px 0;">${sanitizedData.serialNumber}</td></tr>` : ''}
          ${sanitizedData.purchaseDate ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Data de Compra:</td><td style="padding: 8px 0;">${new Date(sanitizedData.purchaseDate).toLocaleDateString('pt-BR')}</td></tr>` : ''}
        </table>
      </div>

      <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">Descrição do Problema</h3>
        <p style="color: #78350f; line-height: 1.6; margin: 0;">${sanitizedData.problemDescription.replace(/\n/g, '<br>')}</p>
      </div>

      ${files.length > 0 ? `
        <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0;">Anexos</h3>
          <p style="color: #047857; margin: 0;">${files.length} imagem(ns) anexada(s) neste email.</p>
        </div>
      ` : ''}

      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
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
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER || 'screletronicaind@gmail.com',
      to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
      subject: `🔧 Nova Solicitação de Reparo - ${sanitizedData.fullName}`,
      html: createEmailTemplate('Nova Solicitação de Reparo', emailContent, 'repair'),
      attachments: attachments
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email de reparo enviado com sucesso:', info.messageId);

    // Limpar arquivos após envio bem-sucedido
    setTimeout(() => {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erro ao deletar arquivo:', err);
        });
      });
    }, 5000); // Aguardar 5 segundos antes de deletar

    res.status(200).json({
      success: true,
      message: 'Solicitação de reparo enviada com sucesso!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erro ao processar solicitação de reparo:', error);
    
    // Limpar arquivos em caso de erro
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erro ao deletar arquivo:', err);
        });
      });
    }
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erro de autenticação do email. Verifique as credenciais.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Erro de conexão. Tente novamente em alguns minutos.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota para envio de mensagem
app.post('/api/send-message', strictLimiter, messageValidators, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const sanitizedData = sanitizeData(req.body);

    // Log da requisição
    console.log(`[${new Date().toISOString()}] Nova mensagem de ${sanitizedData.fullName}`);

    const transporter = createTransporter();

    // Mapear categorias para nomes mais amigáveis
    const categoryNames = {
      'duvida': 'Dúvida Técnica',
      'orcamento': 'Solicitação de Orçamento',
      'informacao': 'Informações sobre Produtos',
      'sugestao': 'Sugestão',
      'reclamacao': 'Reclamação',
      'elogio': 'Elogio',
      'outro': 'Outro'
    };

    const categoryName = categoryNames[sanitizedData.category] || sanitizedData.category;

    // Conteúdo do email
    const emailContent = `
      <h2 style="color: #059669; margin-top: 0;">Nova Mensagem Recebida</h2>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Dados do Remetente</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Nome:</td><td style="padding: 8px 0;">${sanitizedData.fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Telefone:</td><td style="padding: 8px 0;">${sanitizedData.phone}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${sanitizedData.email}" style="color: #059669;">${sanitizedData.email}</a></td></tr>
        </table>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Detalhes da Mensagem</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Assunto:</td><td style="padding: 8px 0;">${sanitizedData.subject}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Categoria:</td><td style="padding: 8px 0;"><span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${categoryName}</span></td></tr>
        </table>
      </div>

      <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
        <h3 style="color: #065f46; margin-top: 0;">Mensagem</h3>
        <div style="background: white; padding: 20px; border-radius: 6px; border-left: 3px solid #10b981;">
          <p style="color: #374151; line-height: 1.6; margin: 0;">${sanitizedData.message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>

      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
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
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER || 'screletronicaind@gmail.com',
      to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
      subject: `💬 ${categoryName} - ${sanitizedData.subject}`,
      html: createEmailTemplate('Nova Mensagem Recebida', emailContent, 'message'),
      replyTo: sanitizedData.email
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Mensagem enviada com sucesso:', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erro de autenticação do email. Verifique as credenciais.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Erro de conexão. Tente novamente em alguns minutos.';
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
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/repair-request - Solicitação de reparo',
      'POST /api/send-message - Envio de mensagem',
      'GET /api/health - Health check'
    ]
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SCR Customer Service API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  // Erro de upload
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo 10MB por arquivo.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos. Máximo 5 arquivos.'
      });
    }
  }
  
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
  console.log(`📧 Serviço de email configurado para: ${process.env.EMAIL_USER || 'screletronicaind@gmail.com'}`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/test`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads: ${uploadsDir}`);
});

module.exports = app;
