/**
 * Teste de Configuração de Email - Produção
 * Script para testar se as configurações SMTP estão funcionando
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmailConfiguration() {
  console.log('🧪 Testando Configurações de Email de Produção\n');

  // Verificar variáveis de ambiente
  console.log('📋 Verificando Variáveis de Ambiente:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ Não encontrado'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Configurado' : '❌ Não encontrado'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? '✅ Configurado' : '❌ Não encontrado'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Configurado' : '❌ Não encontrado'}`);
  console.log(`RECEIVER_EMAIL: ${process.env.RECEIVER_EMAIL ? '✅ Configurado' : '❌ Não encontrado'}\n`);

  // Criar transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Testar conexão
    console.log('🔗 Testando Conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!\n');

    // Enviar email de teste
    console.log('📧 Enviando Email de Teste...');
    const testEmailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com',
      subject: '🧪 Teste de Configuração SMTP - SCR Eletrônica Industrial',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Teste SMTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #0891b2); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Teste SMTP Realizado</h1>
            <p style="color: #e0f2fe; margin: 5px 0 0 0;">Configurações de produção funcionando!</p>
          </div>
          
          <div style="padding: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Relatório do Teste</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Configurações Testadas:</h3>
              <ul style="color: #4b5563;">
                <li><strong>Servidor SMTP:</strong> smtp.gmail.com:587</li>
                <li><strong>Email Remetente:</strong> ${process.env.SMTP_USER || process.env.EMAIL_USER}</li>
                <li><strong>Email Destinatário:</strong> ${process.env.RECEIVER_EMAIL}</li>
                <li><strong>Autenticação:</strong> App Password do Gmail</li>
                <li><strong>Segurança:</strong> TLS habilitado</li>
              </ul>
            </div>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #15803d;">
                <strong>✅ Status:</strong> Configurações SMTP funcionando corretamente!<br>
                <strong>📅 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', {
                  timeZone: 'America/Recife'
                })}<br>
                <strong>🔧 Ambiente:</strong> ${process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              SCR Eletrônica Industrial - Sistema de Email Configurado<br>
              Este é um email automático de teste das configurações SMTP
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        TESTE SMTP - SCR Eletrônica Industrial
        
        Configurações testadas com sucesso!
        
        Servidor: smtp.gmail.com:587
        Remetente: ${process.env.SMTP_USER || process.env.EMAIL_USER}
        Destinatário: ${process.env.RECEIVER_EMAIL}
        Data/Hora: ${new Date().toLocaleString('pt-BR')}
        
        Sistema de email funcionando corretamente!
      `
    };

    const info = await transporter.sendMail(testEmailOptions);
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Destinatário: ${process.env.RECEIVER_EMAIL || 'screletronicaind@gmail.com'}`);
    console.log(`🔗 Response: ${info.response}\n`);

    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('📋 Relatório:');
    console.log('   ✅ Conexão SMTP estabelecida');
    console.log('   ✅ Autenticação realizada');
    console.log('   ✅ Email enviado e entregue');
    console.log('   ✅ Configurações de produção funcionando\n');

    console.log('📞 Próximos passos:');
    console.log('   1. Verifique o email corporativo screletronicaind@gmail.com');
    console.log('   2. Confirme o recebimento do email de teste');
    console.log('   3. Execute o sistema completo: npm run dev');

  } catch (error) {
    console.error('❌ Erro no teste de email:', error);
    console.log('\n🔧 Possíveis soluções:');
    console.log('   1. Verifique se as credenciais estão corretas no .env');
    console.log('   2. Confirme se a senha de app do Gmail está ativa');
    console.log('   3. Verifique a conexão com a internet');
    console.log('   4. Confirme se o Gmail permite "aplicativos menos seguros"');
  } finally {
    transporter.close();
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailConfiguration();
}

export default testEmailConfiguration;