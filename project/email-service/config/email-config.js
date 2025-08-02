/**
 * Email Service Configuration
 * Supports multiple email providers and protocols
 */

const emailConfig = {
  // IMAP Configuration (recommended for most use cases)
  imap: {
    gmail: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
      },
      tlsOptions: {
        rejectUnauthorized: false
      }
    },
    outlook: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    },
    yahoo: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  },

  // POP3 Configuration (for simple download scenarios)
  pop3: {
    gmail: {
      host: 'pop.gmail.com',
      port: 995,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    },
    outlook: {
      host: 'outlook.office365.com',
      port: 995,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  },

  // SMTP Configuration for sending emails
  smtp: {
    gmail: {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    },
    outlook: {
      service: 'hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    },
    custom: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  },

  // General settings
  settings: {
    maxConnections: 5,
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    debug: process.env.NODE_ENV === 'development',
    
    // Retry configuration
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    
    // Rate limiting
    rateLimit: {
      maxEmails: 100,
      timeWindow: 3600000 // 1 hour
    }
  }
};

module.exports = emailConfig;