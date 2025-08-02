import multer from 'multer';

// Middleware de erro global
export const globalErrorHandler = (err, req, res, next) => {
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
};

// Middleware para rotas não encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
};