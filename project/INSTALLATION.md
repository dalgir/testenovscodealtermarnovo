# 🚀 Guia de Instalação - SCR Customer Service

## 📋 Pré-requisitos

- **Node.js** versão 16 ou superior
- **npm** ou **yarn**
- **Conta Gmail** com senha de app configurada

---

## 🔧 Instalação Completa

### 1. Clonar/Baixar o Projeto
```bash
# Se usando Git
git clone <repository-url>
cd scr-customer-service

# Ou extrair arquivos baixados
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

#### Copiar arquivo de exemplo
```bash
cp .env.example .env
```

#### Editar arquivo `.env`
```env
# Configuração do Email
EMAIL_USER=screletronicaind@gmail.com
EMAIL_PASS=sua_senha_de_app_aqui

# Configuração do Servidor
PORT=5000
NODE_ENV=development
```

### 4. Configurar Gmail (Senha de App)

#### Passo a passo:
1. Acesse [Conta Google](https://myaccount.google.com/)
2. Vá em **Segurança** → **Verificação em duas etapas** (ative se não estiver ativo)
3. Vá em **Senhas de app**
4. Selecione **App personalizado** e digite "SCR Website"
5. Copie a senha gerada (16 caracteres)
6. Cole no arquivo `.env` como `EMAIL_PASS`

### 5. Criar Diretórios Necessários
```bash
mkdir uploads
mkdir logs
```

---

## 🚀 Executar o Projeto

### Opção 1: Executar Separadamente
```bash
# Terminal 1 - Frontend (React)
npm run dev

# Terminal 2 - Backend (Node.js)
npm run server
```

### Opção 2: Executar Tudo Junto (Recomendado)
```bash
npm run dev:full
```

### Opção 3: Apenas Backend
```bash
npm run dev:server  # Com auto-reload
# ou
npm run server      # Sem auto-reload
```

---

## 🌐 Acessar o Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Teste da API:** http://localhost:5000/api/test
- **Health Check:** http://localhost:5000/api/health

---

## 📦 Scripts Disponíveis

```json
{
  "dev": "vite",                    // Frontend React
  "build": "vite build",            // Build de produção
  "server": "node server-enhanced.js", // Backend
  "dev:server": "nodemon server-enhanced.js", // Backend com auto-reload
  "dev:full": "concurrently \"npm run dev\" \"npm run dev:server\"" // Tudo junto
}
```

---

## 🧪 Testar a Instalação

### 1. Teste Básico da API
```bash
curl http://localhost:5000/api/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Backend funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Teste de Health Check
```bash
curl http://localhost:5000/api/health
```

### 3. Teste do Frontend
- Acesse http://localhost:5173
- Navegue até a seção "Atendimento ao Cliente"
- Teste os formulários

---

## 📁 Estrutura do Projeto

```
scr-customer-service/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── CustomerServiceForms.tsx  # Formulários principais
│   │   ├── Contact.tsx              # Formulário de contato simples
│   │   └── ...
│   └── ...
├── server-enhanced.js            # Backend Node.js
├── uploads/                      # Diretório de uploads (criado automaticamente)
├── logs/                        # Logs do sistema
├── .env                         # Variáveis de ambiente (não commitado)
├── .env.example                 # Exemplo de variáveis
├── package.json                 # Dependências e scripts
├── API-Documentation.md         # Documentação da API
└── INSTALLATION.md             # Este arquivo
```

---

## 🔧 Dependências Principais

### Frontend
- **React 18** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Framer Motion** - Animações

### Backend
- **Express** - Framework web
- **Nodemailer** - Envio de emails
- **Multer** - Upload de arquivos
- **Helmet** - Segurança
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Validação

---

## 🛡️ Configurações de Segurança

### Rate Limiting
- **Geral:** 10 requests por 15 minutos
- **Formulários:** 5 envios por hora
- **Configurável** no arquivo `server-enhanced.js`

### Upload de Arquivos
- **Tipos permitidos:** Apenas imagens
- **Tamanho máximo:** 10MB por arquivo
- **Quantidade máxima:** 5 arquivos
- **Limpeza automática:** Arquivos deletados após envio

### Validação
- **Sanitização** de dados de entrada
- **Validação** de campos obrigatórios
- **Proteção** contra XSS básico

---

## 🚨 Troubleshooting

### Erro: "EAUTH" (Autenticação Gmail)
**Solução:**
1. Verifique se a verificação em duas etapas está ativada
2. Gere uma nova senha de app
3. Confirme se está usando a senha de app (não a senha normal)

### Erro: "EADDRINUSE" (Porta em uso)
**Solução:**
```bash
# Verificar processo na porta 5000
lsof -ti:5000

# Matar processo
kill -9 $(lsof -ti:5000)

# Ou usar porta diferente
PORT=5001 npm run server
```

### Erro: "Cannot find module"
**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Permission denied" (uploads)
**Solução:**
```bash
# Dar permissões ao diretório
chmod 755 uploads
```

### Frontend não carrega
**Solução:**
1. Verifique se o Vite está rodando na porta 5173
2. Limpe o cache do navegador
3. Verifique se não há conflitos de porta

### Emails não são enviados
**Solução:**
1. Verifique as credenciais no `.env`
2. Teste a conexão com Gmail
3. Verifique logs do servidor
4. Confirme se a senha de app está correta

---

## 📊 Monitoramento

### Logs do Sistema
```bash
# Ver logs em tempo real
tail -f logs/combined.log

# Ver apenas erros
tail -f logs/error.log
```

### Verificar Status
```bash
# Status da API
curl http://localhost:5000/api/health

# Verificar processos
ps aux | grep node
```

---

## 🔄 Atualizações

### Atualizar Dependências
```bash
# Verificar atualizações
npm outdated

# Atualizar todas
npm update

# Atualizar específica
npm install express@latest
```

### Backup de Configurações
```bash
# Fazer backup do .env
cp .env .env.backup

# Fazer backup dos uploads (se necessário)
tar -czf uploads-backup.tar.gz uploads/
```

---

## 🌐 Deploy em Produção

### Variáveis de Ambiente de Produção
```env
NODE_ENV=production
PORT=5000
EMAIL_USER=screletronicaind@gmail.com
EMAIL_PASS=senha_de_app_producao
```

### Build de Produção
```bash
# Build do frontend
npm run build

# Servir arquivos estáticos (opcional)
npm install -g serve
serve -s dist -l 3000
```

### PM2 (Recomendado para produção)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server-enhanced.js --name "scr-api"

# Monitorar
pm2 monit

# Logs
pm2 logs scr-api
```

---

## 📞 Suporte

### Em caso de problemas:

1. **Verifique os logs** do servidor
2. **Teste a API** com curl ou Postman
3. **Confirme as configurações** do Gmail
4. **Verifique as permissões** de arquivos

### Contato:
- **Email:** screletronicaind@gmail.com
- **Telefone:** (81) 99926-6729

---

**✅ Instalação concluída com sucesso!**

O sistema está pronto para receber solicitações de reparo e mensagens dos clientes.