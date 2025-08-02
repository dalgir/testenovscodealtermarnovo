/**
 * Basic Usage Examples for Email Service
 */

require('dotenv').config();
const EmailService = require('../EmailService');
const logger = require('../utils/logger');

async function basicUsageExamples() {
  // Initialize email service for Gmail
  const emailService = new EmailService('gmail');

  try {
    // Initialize IMAP and SMTP services
    await emailService.initialize(['imap', 'smtp']);

    // Example 1: Get unread emails using IMAP
    console.log('\n=== Getting Unread Emails ===');
    const unreadEmails = await emailService.getUnreadEmails();
    console.log(`Found ${unreadEmails.length} unread emails`);
    
    unreadEmails.forEach((email, index) => {
      console.log(`${index + 1}. From: ${email.from?.text || 'Unknown'}`);
      console.log(`   Subject: ${email.subject || 'No Subject'}`);
      console.log(`   Date: ${email.date || 'Unknown'}`);
      console.log(`   Attachments: ${email.attachments?.length || 0}`);
      console.log('---');
    });

    // Example 2: Send a simple email
    console.log('\n=== Sending Simple Email ===');
    const simpleEmailResult = await emailService.sendEmail({
      to: 'recipient@example.com',
      subject: 'Test Email from Node.js',
      text: 'This is a plain text email sent using our email service.',
      html: '<h1>Test Email</h1><p>This is an <strong>HTML email</strong> sent using our email service.</p>'
    });
    console.log('Simple email sent:', simpleEmailResult.messageId);

    // Example 3: Send email with attachments
    console.log('\n=== Sending Email with Attachments ===');
    const emailWithAttachments = await emailService.sendEmail({
      to: 'recipient@example.com',
      subject: 'Email with Attachments',
      html: '<h2>Email with Attachments</h2><p>Please find the attached files.</p>',
      attachments: [
        {
          filename: 'test.txt',
          content: 'This is a test attachment',
          contentType: 'text/plain'
        },
        {
          filename: 'package.json',
          path: './package.json' // Attach existing file
        }
      ]
    });
    console.log('Email with attachments sent:', emailWithAttachments.messageId);

    // Example 4: Send templated email
    console.log('\n=== Sending Templated Email ===');
    const templatedEmailResult = await emailService.sendTemplatedEmail({
      to: 'recipient@example.com',
      subject: 'Welcome to Our Service',
      title: 'Welcome!',
      content: `
        <h2>Welcome to Our Email Service!</h2>
        <p>Thank you for joining us. Here are some key features:</p>
        <ul>
          <li>IMAP and POP3 support for receiving emails</li>
          <li>SMTP support for sending emails</li>
          <li>Attachment handling</li>
          <li>HTML templates</li>
          <li>Rate limiting and error handling</li>
        </ul>
        <p>Best regards,<br>The Email Service Team</p>
      `,
      footer: 'This email was sent automatically. Please do not reply.'
    });
    console.log('Templated email sent:', templatedEmailResult.messageId);

    // Example 5: Get emails by date range
    console.log('\n=== Getting Emails by Date Range ===');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    const endDate = new Date();

    const recentEmails = await emailService.getEmailsByDateRange(startDate, endDate);
    console.log(`Found ${recentEmails.length} emails from the last 7 days`);

    // Example 6: Start email monitoring
    console.log('\n=== Starting Email Monitoring ===');
    emailService.on('newMail', (count) => {
      console.log(`📧 ${count} new email(s) received!`);
    });

    await emailService.startEmailMonitoring();
    console.log('Email monitoring started. Waiting for new emails...');

    // Example 7: Test all connections
    console.log('\n=== Testing All Connections ===');
    const connectionTests = await emailService.testAllConnections();
    console.log('Connection test results:', connectionTests);

    // Example 8: Get service status
    console.log('\n=== Service Status ===');
    const status = emailService.getServiceStatus();
    console.log('Service status:', JSON.stringify(status, null, 2));

    // Keep the script running for monitoring (remove in production)
    console.log('\nPress Ctrl+C to stop monitoring...');
    
  } catch (error) {
    logger.error('Error in basic usage examples:', error);
    console.error('Error:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down email service...');
  // Disconnect services here if needed
  process.exit(0);
});

// Run examples
if (require.main === module) {
  basicUsageExamples();
}

module.exports = basicUsageExamples;