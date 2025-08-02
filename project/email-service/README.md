# Node.js Email Service

A comprehensive email service implementation supporting IMAP, POP3, and SMTP protocols with advanced features like rate limiting, bulk sending, and attachment handling.

## Features

### 📧 Email Reception
- **IMAP Support**: Full-featured IMAP client for maintaining email sync across devices
- **POP3 Support**: Simple download-and-delete email retrieval
- **Real-time Monitoring**: Live email monitoring with event notifications
- **Advanced Search**: Search emails by date, sender, subject, and more
- **Attachment Handling**: Extract and save email attachments

### 📤 Email Sending
- **SMTP Support**: Reliable email sending with connection pooling
- **Bulk Email**: Send thousands of emails with rate limiting and batch processing
- **HTML Templates**: Built-in template system for professional emails
- **Attachment Support**: Send files, images, and documents
- **Delivery Tracking**: Monitor email delivery status

### 🔒 Security & Performance
- **Rate Limiting**: Prevent spam and respect provider limits
- **Connection Pooling**: Efficient resource management
- **Error Handling**: Comprehensive error handling and retry logic
- **Logging**: Detailed logging with Winston
- **Authentication**: Secure authentication with app passwords

## Quick Start

### Installation

```bash
npm install node-imap mailparser nodemailer poplib dotenv winston
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your email credentials in `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
```

### Basic Usage

```javascript
const EmailService = require('./EmailService');

async function main() {
  // Initialize email service
  const emailService = new EmailService('gmail');
  await emailService.initialize(['imap', 'smtp']);

  // Get unread emails
  const unreadEmails = await emailService.getUnreadEmails();
  console.log(`Found ${unreadEmails.length} unread emails`);

  // Send an email
  const result = await emailService.sendEmail({
    to: 'recipient@example.com',
    subject: 'Hello from Node.js',
    html: '<h1>Hello!</h1><p>This email was sent using our email service.</p>'
  });
  console.log('Email sent:', result.messageId);

  // Cleanup
  await emailService.disconnect();
}

main().catch(console.error);
```

## Protocol Comparison

### IMAP vs POP3

| Feature | IMAP | POP3 |
|---------|------|------|
| **Multi-device sync** | ✅ Yes | ❌ No |
| **Server storage** | ✅ Emails stay on server | ❌ Downloads and deletes |
| **Folder support** | ✅ Full folder hierarchy | ❌ Inbox only |
| **Partial download** | ✅ Headers, body parts | ❌ Full message only |
| **Search capabilities** | ✅ Server-side search | ❌ Local search only |
| **Bandwidth usage** | ✅ Efficient | ❌ Downloads everything |
| **Offline access** | ✅ Cached messages | ✅ All downloaded messages |
| **Best for** | Multiple devices, web apps | Single device, simple backup |

### When to Use Each Protocol

**Use IMAP when:**
- Building web applications or mobile apps
- Users access email from multiple devices
- You need real-time email monitoring
- Advanced search and folder management is required
- Collaborative email management

**Use POP3 when:**
- Simple email backup or archiving
- Single-device email access
- Limited server storage
- Offline email processing
- Simple download-and-process workflows

## Advanced Examples

### Real-time Email Monitoring

```javascript
const emailService = new EmailService('gmail');
await emailService.initialize(['imap']);

// Start monitoring for new emails
emailService.on('newMail', async (count) => {
  console.log(`📧 ${count} new email(s) received!`);
  
  // Process new emails
  const newEmails = await emailService.getUnreadEmails();
  for (const email of newEmails) {
    console.log(`New email: ${email.subject}`);
    // Process email...
  }
});

await emailService.startEmailMonitoring();
```

### Bulk Email Sending

```javascript
const emailList = [
  { to: 'user1@example.com', subject: 'Welcome!', html: '<h1>Welcome!</h1>' },
  { to: 'user2@example.com', subject: 'Welcome!', html: '<h1>Welcome!</h1>' },
  // ... more emails
];

const result = await emailService.sendBulkEmails(emailList, {
  batchSize: 10,  // Send 10 emails at a time
  delay: 1000     // Wait 1 second between batches
});

console.log(`Sent ${result.successful}/${result.total} emails`);
```

### Email with Attachments

```javascript
await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: 'Files Attached',
  html: '<p>Please find the attached files.</p>',
  attachments: [
    {
      filename: 'document.pdf',
      path: './files/document.pdf'
    },
    {
      filename: 'data.json',
      content: JSON.stringify({ key: 'value' }),
      contentType: 'application/json'
    }
  ]
});
```

### POP3 Email Download

```javascript
const emailService = new EmailService('gmail');
await emailService.initialize(['pop3']);

// Download all emails (keep on server)
const emails = await emailService.downloadAllEmailsPop3(false);

// Process emails
for (const email of emails) {
  console.log(`From: ${email.from?.text}`);
  console.log(`Subject: ${email.subject}`);
  
  // Save attachments
  if (email.attachments?.length > 0) {
    for (const attachment of email.attachments) {
      await fs.writeFile(`./attachments/${attachment.filename}`, attachment.content);
    }
  }
}
```

## Configuration Options

### Email Providers

The service supports multiple email providers:

- **Gmail**: Requires app-specific passwords
- **Outlook/Hotmail**: Standard authentication
- **Yahoo**: Standard authentication
- **Custom SMTP**: Configure your own server

### Rate Limiting

Configure rate limiting to respect provider limits:

```javascript
const config = {
  settings: {
    rateLimit: {
      maxEmails: 100,      // Max emails per time window
      timeWindow: 3600000  // Time window in milliseconds (1 hour)
    }
  }
};
```

### Connection Settings

```javascript
const config = {
  settings: {
    maxConnections: 5,        // Max concurrent connections
    connectionTimeout: 60000, // Connection timeout (60 seconds)
    retryAttempts: 3,         // Retry attempts on failure
    retryDelay: 5000          // Delay between retries (5 seconds)
  }
};
```

## Error Handling

The service includes comprehensive error handling:

```javascript
emailService.on('error', (error) => {
  console.error('Email service error:', error);
});

emailService.on('imapError', (error) => {
  console.error('IMAP error:', error);
});

emailService.on('smtpError', (error) => {
  console.error('SMTP error:', error);
});
```

## Security Best Practices

1. **Use App Passwords**: For Gmail, use app-specific passwords instead of your main password
2. **Enable 2FA**: Always enable two-factor authentication on your email accounts
3. **Environment Variables**: Store credentials in environment variables, never in code
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Validate all email addresses and content
6. **Secure Connections**: Always use SSL/TLS for email connections

## Logging

The service uses Winston for comprehensive logging:

```javascript
// Logs are written to:
// - ./logs/error.log (errors only)
// - ./logs/combined.log (all logs)
// - Console (development mode)
```

## Testing

Run the included examples:

```bash
# Basic usage examples
npm run example:basic

# POP3 specific examples
npm run example:pop3

# Bulk email examples
npm run example:bulk
```

## API Reference

### EmailService Class

#### Constructor
```javascript
new EmailService(provider, options)
```

#### Methods

**Initialization:**
- `initialize(services)` - Initialize specified services
- `disconnect()` - Disconnect all services

**IMAP Methods:**
- `getUnreadEmails()` - Get all unread emails
- `getEmailsByDateRange(start, end)` - Get emails by date range
- `markEmailsAsRead(uids)` - Mark emails as read
- `startEmailMonitoring()` - Start real-time monitoring

**POP3 Methods:**
- `downloadAllEmailsPop3(deleteAfter)` - Download all emails
- `getEmailStatsPop3()` - Get email count and size

**SMTP Methods:**
- `sendEmail(options)` - Send a single email
- `sendBulkEmails(list, options)` - Send multiple emails
- `sendTemplatedEmail(options)` - Send templated email

**Utility Methods:**
- `testAllConnections()` - Test all service connections
- `getServiceStatus()` - Get status of all services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the examples in the `/examples` directory
2. Review the error logs in `/logs`
3. Open an issue on GitHub with detailed information

---

**Note**: This email service is designed for legitimate use cases. Always comply with email provider terms of service and anti-spam regulations.