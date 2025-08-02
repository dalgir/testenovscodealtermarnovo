import express from 'express';
import rateLimit from 'express-rate-limit';
import * as expressValidator from 'express-validator';
import { createTransporter, createEmailTemplate, sanitizeData } from '../utils/emailUtils.js';

const router = express.Router();

// Rate limiting específico para mensagens
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 envios por hora
  message: {
    success: false,
    message: 'Limite de envios atingido. Tente novamente em 1 hora.'
  }
});

// Validadores para mensagem
const messageValidators = [
  expressValidator.body('fullName').trim().notEmpty().withMessage('Nome completo é obrigatório'),
  expressValidator.body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  expressValidator.body('email').isEmail().withMessage('Email inválido'),
  expressValidator.body('subject').trim().notEmpty().withMessage('Assunto é obrigatório'),
  expressValidator.body('category').notEmpty().withMessage('Categoria é obrigatória'),
  expressValidator.body('message').trim().notEmpty().withMessage('Mensagem é obrigatória')
];

// Rota para envio de mensagem
router.post('/send-message', strictLimiter, messageValidators, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = expressValidator.validationResult(req);
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

export default router;