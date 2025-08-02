// IMPORTS: mantêm os seus
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import * as expressValidator from 'express-validator';
import { createTransporter, createEmailTemplate, sanitizeData } from '../utils/emailUtils.js';

const router = express.Router();

// CONFIG: Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `repair-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 🔧 ✅ ACEITA image_0, image_1, image_2...
const imageFields = Array.from({ length: 5 }).map((_, i) => ({ name: `image_${i}` }));
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas arquivos de imagem são permitidos'));
  }
}).fields(imageFields);

// RATE LIMIT
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Limite de envios atingido. Tente novamente em 1 hora.' }
});

// VALIDADORES
const repairValidators = [
  expressValidator.body('fullName').trim().notEmpty().withMessage('Nome completo é obrigatório'),
  expressValidator.body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  expressValidator.body('email').isEmail().withMessage('Email inválido'),
  expressValidator.body('equipmentType').notEmpty().withMessage('Tipo de equipamento é obrigatório'),
  expressValidator.body('problemDescription').trim().notEmpty().withMessage('Descrição do problema é obrigatória')
];

// ROTA POST
router.post('/repair-request', strictLimiter, (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error('Erro no upload:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) cleanFiles(req.files);
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    try {
      const sanitizedData = sanitizeData(req.body);
      const files = Object.values(req.files || {}).flat();

      const transporter = createTransporter();

      const attachments = files.map(file => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype
      }));

      const emailContent = /* HTML DO EMAIL (mantenha o seu original ou o gerado) */ `
        <h2>Nova Solicitação de Reparo</h2>
        <p><strong>Nome:</strong> ${sanitizedData.fullName}</p>
        <p><strong>Telefone:</strong> ${sanitizedData.phone}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Equipamento:</strong> ${sanitizedData.equipmentType}</p>
        <p><strong>Descrição:</strong> ${sanitizedData.problemDescription}</p>
      `;

      const mailOptions = {
        from: process.env.SMTP_USER || 'screletronicaind@gmail.com',
        to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
        subject: `🔧 Nova Solicitação de Reparo - ${sanitizedData.fullName}`,
        html: createEmailTemplate('Nova Solicitação de Reparo', emailContent, 'repair'),
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);

      setTimeout(() => cleanFiles(req.files), 5000);

      return res.status(200).json({ success: true, message: 'Solicitação enviada com sucesso!', messageId: info.messageId });

    } catch (error) {
      console.error('Erro interno:', error);
      cleanFiles(req.files);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  });
});

// Função para deletar arquivos
function cleanFiles(fileGroups) {
  if (!fileGroups) return;
  Object.values(fileGroups).flat().forEach(file => {
    fs.unlink(file.path, (err) => {
      if (err) console.error('Erro ao deletar arquivo:', err);
    });
  });
}

export default router;
