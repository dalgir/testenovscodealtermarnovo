# SCR Eletrônica Industrial - Sistema de Atendimento ao Cliente

Sistema completo de atendimento ao cliente com frontend React e backend Node.js para gerenciar solicitações de reparo e mensagens.

## 📁 Estrutura do Projeto

```
├── frontend/                 # Aplicação React (Frontend)
│   ├── src/                 # Código fonte React
│   ├── public/              # Arquivos estáticos
│   ├── package.json         # Dependências do frontend
│   └── vite.config.ts       # Configuração do Vite
├── backend/                 # API Node.js (Backend)
│   ├── src/                 # Código fonte da API
│   │   ├── server.js        # Servidor principal
│   │   └── test-email-config.js # Teste de email
│   ├── uploads/             # Diretório de uploads (criado automaticamente)
│   ├── .env                 # Variáveis de ambiente
│   └── package.json         # Dependências do backend
└── README.md                # Este arquivo
```

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado no backend com as credenciais de produção:

```env
EMAIL_USER=screletronicaind@gmail.com
EMAIL_PASS=qgnckypgmansxbci
SMTP_USER=screletronicaind@gmail.com
SMTP_PASS=qgnckypgmansxbci
RECEIVER_EMAIL=screletronicaind@gmail.com
PORT=5000
NODE_ENV=production
```

### 3. Executar o Sistema

#### Opção 1: Executar separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Opção 2: Executar com script único (na raiz)
```bash
# Criar script na raiz do projeto
npm run dev:full
```

### 4. Testar Configuração de Email

```bash
cd backend
npm run test
```

## 📧 Funcionalidades

### Frontend (React + TypeScript)
- **Interface responsiva** com Tailwind CSS
- **Dois formulários principais:**
  1. **Solicitação de Reparo** - Com upload de imagens
  2. **Envio de Mensagem** - Para comunicação geral
- **Validação completa** de campos
- **Feedback visual** (loading, sucesso, erro)
- **Design profissional** da SCR

### Backend (Node.js + Express)
- **API RESTful** com endpoints dedicados
- **Sistema de email automático** com templates HTML
- **Upload de arquivos** (até 5 imagens de 10MB)
- **Segurança:** Rate limiting, validação, sanitização
- **Logs detalhados** de operações

## 🔗 Endpoints da API

- `POST /api/repair-request` - Solicitação de reparo
- `POST /api/send-message` - Envio de mensagem
- `GET /api/test` - Teste da API
- `GET /api/health` - Status do servidor

## 🛡️ Segurança

- **Rate Limiting:** 10 requests/15min geral, 5 envios/hora
- **Validação rigorosa** de dados
- **Sanitização** contra XSS
- **Upload seguro** apenas de imagens
- **CORS** configurado para localhost

## 📱 Acesso

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Teste da API:** http://localhost:5000/api/test

## 📞 Suporte

- **Email:** screletronicaind@gmail.com
- **Telefone:** (81) 99926-6729
- **Endereço:** AV. Afonso Olindense 216, sala 02, Várzea, PE - 50810-000

---

**© 2024 SCR Eletrônica Industrial - Sistema de Atendimento ao Cliente**