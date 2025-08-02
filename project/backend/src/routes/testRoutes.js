import express from 'express';

const router = express.Router();

// Rota de teste
router.get('/test', (req, res) => {
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
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SCR Customer Service API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

export default router;