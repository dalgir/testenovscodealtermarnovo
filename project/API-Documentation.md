# 📋 API Documentation - SCR Customer Service

## 🚀 Visão Geral

API RESTful completa para gerenciar formulários de atendimento ao cliente da SCR Eletrônica Industrial.

### 🔧 Tecnologias Utilizadas
- **Backend:** Node.js + Express
- **Email:** Nodemailer (Gmail SMTP)
- **Upload:** Multer
- **Segurança:** Helmet, Rate Limiting, Express Validator
- **Validação:** Express Validator

---

## 🛡️ Segurança

### Rate Limiting
- **Geral:** 10 requests por 15 minutos por IP
- **Formulários:** 5 envios por hora por IP
- **Headers:** Helmet para segurança básica

### Validação
- Sanitização de dados de entrada
- Validação de tipos de arquivo
- Limite de tamanho de arquivos (10MB)
- Validação de campos obrigatórios

---

## 📡 Endpoints

### 1. 🔧 Solicitação de Reparo

**POST** `/api/repair-request`

Recebe solicitações de reparo com dados do cliente, equipamento e imagens.

#### Headers
```
Content-Type: multipart/form-data
```

#### Body (FormData)
```javascript
{
  // Dados Pessoais (obrigatórios)
  fullName: "João Silva",
  phone: "(81) 99999-9999", 
  email: "joao@email.com",
  
  // Dados do Equipamento (obrigatórios)
  equipmentType: "inversor", // inversor, placa, motor, sensor, controlador, fonte, servo, outro
  problemDescription: "Descrição detalhada do problema...",
  
  // Dados Opcionais
  brandModel: "Siemens G120",
  serialNumber: "ABC123456",
  purchaseDate: "2023-01-15", // YYYY-MM-DD
  
  // Imagens (opcional, máximo 5 arquivos de 10MB cada)
  image_0: File,
  image_1: File,
  // ...
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Solicitação de reparo enviada com sucesso!",
  "messageId": "email-message-id"
}
```

#### Resposta de Erro (400/500)
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    {
      "field": "fullName",
      "message": "Nome completo é obrigatório"
    }
  ]
}
```

---

### 2. 💬 Envio de Mensagem

**POST** `/api/send-message`

Recebe mensagens gerais dos clientes.

#### Headers
```
Content-Type: application/json
```

#### Body (JSON)
```json
{
  // Dados Pessoais (obrigatórios)
  "fullName": "Maria Santos",
  "phone": "(81) 88888-8888",
  "email": "maria@email.com",
  
  // Dados da Mensagem (obrigatórios)
  "subject": "Dúvida sobre produto",
  "category": "duvida", // duvida, orcamento, informacao, sugestao, reclamacao, elogio, outro
  "message": "Mensagem detalhada..."
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!",
  "messageId": "email-message-id"
}
```

---

### 3. 🧪 Teste da API

**GET** `/api/test`

Verifica se a API está funcionando.

#### Resposta (200)
```json
{
  "success": true,
  "message": "Backend funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": [
    "POST /api/repair-request - Solicitação de reparo",
    "POST /api/send-message - Envio de mensagem",
    "GET /api/health - Health check"
  ]
}
```

---

### 4. 💚 Health Check

**GET** `/api/health`

Verifica o status detalhado do servidor.

#### Resposta (200)
```json
{
  "status": "OK",
  "service": "SCR Customer Service API",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1234567
  },
  "version": "2.0.0"
}
```

---

## 📧 Sistema de Email

### Configuração SMTP
```env
EMAIL_USER=screletronicaind@gmail.com
EMAIL_PASS=sua_senha_de_app_aqui
```

### Templates de Email

#### 🔧 Email de Reparo
- **Assunto:** `🔧 Nova Solicitação de Reparo - [Nome do Cliente]`
- **Conteúdo:** Dados do cliente, equipamento, problema e anexos
- **Anexos:** Imagens enviadas pelo cliente

#### 💬 Email de Mensagem
- **Assunto:** `💬 [Categoria] - [Assunto]`
- **Conteúdo:** Dados do remetente e mensagem
- **Reply-To:** Email do cliente

### Recursos dos Templates
- Design responsivo e profissional
- Cores da marca SCR
- Informações organizadas em seções
- Data/hora automática
- Dados de contato da empresa

---

## 📁 Upload de Arquivos

### Configuração
- **Diretório:** `/uploads`
- **Tipos permitidos:** Apenas imagens (image/*)
- **Tamanho máximo:** 10MB por arquivo
- **Quantidade máxima:** 5 arquivos por solicitação

### Limpeza Automática
- Arquivos são deletados após envio bem-sucedido (5 segundos)
- Arquivos são deletados imediatamente em caso de erro
- Prevenção de acúmulo de arquivos no servidor

---

## 🚨 Códigos de Erro

### 400 - Bad Request
- Dados de validação inválidos
- Arquivo muito grande (>10MB)
- Muitos arquivos (>5)
- Tipo de arquivo não permitido

### 429 - Too Many Requests
- Rate limit atingido
- Muitas tentativas em pouco tempo

### 500 - Internal Server Error
- Erro de autenticação do email (EAUTH)
- Erro de conexão (ECONNECTION)
- Erro interno do servidor

---

## 🔧 Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install express nodemailer cors dotenv multer helmet express-rate-limit express-validator
```

### 2. Configurar Variáveis de Ambiente
```env
# .env
EMAIL_USER=screletronicaind@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail
PORT=5000
NODE_ENV=development
```

### 3. Executar o Servidor
```bash
# Desenvolvimento
npm run dev:server

# Produção
npm run server

# Frontend + Backend
npm run dev:full
```

### 4. Testar a API
```bash
# Teste básico
curl http://localhost:5000/api/test

# Health check
curl http://localhost:5000/api/health
```

---

## 📊 Logs e Monitoramento

### Logs Automáticos
- Todas as requisições são logadas com timestamp
- Erros são logados com detalhes completos
- Sucessos incluem messageId do email

### Exemplo de Log
```
[2024-01-15T10:30:00.000Z] Nova solicitação de reparo de João Silva
Email de reparo enviado com sucesso: <message-id@gmail.com>
```

---

## 🧪 Exemplos de Uso

### JavaScript (Frontend)
```javascript
// Solicitação de Reparo
const formData = new FormData();
formData.append('fullName', 'João Silva');
formData.append('phone', '(81) 99999-9999');
formData.append('email', 'joao@email.com');
formData.append('equipmentType', 'inversor');
formData.append('problemDescription', 'Problema detalhado...');
formData.append('image_0', fileInput.files[0]);

const response = await fetch('/api/repair-request', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

```javascript
// Envio de Mensagem
const response = await fetch('/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'Maria Santos',
    phone: '(81) 88888-8888',
    email: 'maria@email.com',
    subject: 'Dúvida sobre produto',
    category: 'duvida',
    message: 'Mensagem detalhada...'
  })
});

const result = await response.json();
```

### cURL
```bash
# Teste de mensagem
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Teste API",
    "phone": "(81) 99999-9999",
    "email": "teste@email.com",
    "subject": "Teste da API",
    "category": "duvida",
    "message": "Mensagem de teste via cURL"
  }'
```

---

## 🔄 Versionamento

**Versão Atual:** 2.0.0

### Changelog
- **2.0.0:** Sistema completo com dois formulários
- **1.0.0:** Sistema básico de contato

---

## 📞 Suporte

Para dúvidas sobre a API:
- **Email:** screletronicaind@gmail.com
- **Telefone:** (81) 99926-6729
- **Documentação:** Este arquivo

---

**© 2024 SCR Eletrônica Industrial - Todos os direitos reservados**