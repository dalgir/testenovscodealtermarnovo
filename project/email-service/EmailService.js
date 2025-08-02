/**
 * Main Email Service Class
 * Orchestrates IMAP, POP3, and SMTP services
 */

const ImapService = require('./services/ImapService');
const Pop3Service = require('./services/Pop3Service');
const SmtpService = require('./services/SmtpService');
const emailConfig = require('./config/email-config');
const logger = require('./utils/logger');
const EventEmitter = require('events');

class EmailService extends EventEmitter {
  constructor(provider = 'gmail', options = {}) {
    super();
    this.provider = provider;
    this.options = options;
    
    // Initialize services
    this.imapService = null;
    this.pop3Service = null;
    this.smtpService = null;
    
    // Service configurations
    this.imapConfig = emailConfig.imap[provider];
    this.pop3Config = emailConfig.pop3[provider];
    this.smtpConfig = emailConfig.smtp[provider];
    
    if (!this.imapConfig || !this.pop3Config || !this.smtpConfig) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    // Add general settings to each config
    this.imapConfig.settings = emailConfig.settings;
    this.pop3Config.settings = emailConfig.settings;
    this.smtpConfig.settings = emailConfig.settings;
  }

  /**
   * Initialize IMAP service
   */
  async initializeImap() {
    try {
      this.imapService = new ImapService(this.imapConfig);
      
      // Forward events
      this.imapService.on('connected', () => this.emit('imapConnected'));
      this.imapService.on('disconnected', () => this.emit('imapDisconnected'));
      this.imapService.on('error', (err) => this.emit('imapError', err));
      this.imapService.on('newMail', (count) => this.emit('newMail', count));
      
      await this.imapService.connect();
      logger.info('IMAP service initialized');
      return this.imapService;
    } catch (error) {
      logger.error('Failed to initialize IMAP service:', error);
      throw error;
    }
  }

  /**
   * Initialize POP3 service
   */
  async initializePop3() {
    try {
      this.pop3Service = new Pop3Service(this.pop3Config);
      
      // Forward events
      this.pop3Service.on('connected', () => this.emit('pop3Connected'));
      this.pop3Service.on('disconnected', () => this.emit('pop3Disconnected'));
      this.pop3Service.on('error', (err) => this.emit('pop3Error', err));
      this.pop3Service.on('downloadProgress', (progress) => this.emit('downloadProgress', progress));
      
      await this.pop3Service.connect();
      logger.info('POP3 service initialized');
      return this.pop3Service;
    } catch (error) {
      logger.error('Failed to initialize POP3 service:', error);
      throw error;
    }
  }

  /**
   * Initialize SMTP service
   */
  async initializeSmtp() {
    try {
      this.smtpService = new SmtpService(this.smtpConfig);
      
      // Forward events
      this.smtpService.on('connected', () => this.emit('smtpConnected'));
      this.smtpService.on('disconnected', () => this.emit('smtpDisconnected'));
      this.smtpService.on('error', (err) => this.emit('smtpError', err));
      this.smtpService.on('emailSent', (info) => this.emit('emailSent', info));
      this.smtpService.on('bulkProgress', (progress) => this.emit('bulkProgress', progress));
      
      await this.smtpService.connect();
      logger.info('SMTP service initialized');
      return this.smtpService;
    } catch (error) {
      logger.error('Failed to initialize SMTP service:', error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  async initialize(services = ['imap', 'smtp']) {
    const results = {};
    
    try {
      if (services.includes('imap')) {
        results.imap = await this.initializeImap();
      }
      
      if (services.includes('pop3')) {
        results.pop3 = await this.initializePop3();
      }
      
      if (services.includes('smtp')) {
        results.smtp = await this.initializeSmtp();
      }
      
      logger.info(`Email service initialized with: ${services.join(', ')}`);
      this.emit('initialized', services);
      
      return results;
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * IMAP Methods - Recommended for most use cases
   */

  async getUnreadEmails() {
    if (!this.imapService) {
      throw new Error('IMAP service not initialized');
    }

    await this.imapService.openBox('INBOX', true);
    const uids = await this.imapService.searchEmails(['UNSEEN']);
    
    if (uids.length === 0) {
      return [];
    }

    const emails = [];
    for (const uid of uids) {
      const email = await this.imapService.fetchFullEmail(uid);
      emails.push(email);
    }

    return emails;
  }

  async getEmailsByDateRange(startDate, endDate) {
    if (!this.imapService) {
      throw new Error('IMAP service not initialized');
    }

    await this.imapService.openBox('INBOX', true);
    const criteria = [
      'SINCE', startDate.toISOString().split('T')[0],
      'BEFORE', endDate.toISOString().split('T')[0]
    ];
    
    const uids = await this.imapService.searchEmails(criteria);
    
    const emails = [];
    for (const uid of uids) {
      const email = await this.imapService.fetchFullEmail(uid);
      emails.push(email);
    }

    return emails;
  }

  async markEmailsAsRead(uids) {
    if (!this.imapService) {
      throw new Error('IMAP service not initialized');
    }

    await this.imapService.openBox('INBOX', false);
    return this.imapService.markAsRead(uids);
  }

  async startEmailMonitoring() {
    if (!this.imapService) {
      throw new Error('IMAP service not initialized');
    }

    this.imapService.startMonitoring('INBOX');
    logger.info('Email monitoring started');
  }

  /**
   * POP3 Methods - For simple download scenarios
   */

  async downloadAllEmailsPop3(deleteAfterDownload = false) {
    if (!this.pop3Service) {
      throw new Error('POP3 service not initialized');
    }

    return this.pop3Service.downloadAllEmails(deleteAfterDownload);
  }

  async getEmailStatsPop3() {
    if (!this.pop3Service) {
      throw new Error('POP3 service not initialized');
    }

    return this.pop3Service.getEmailStats();
  }

  /**
   * SMTP Methods - For sending emails
   */

  async sendEmail(emailOptions) {
    if (!this.smtpService) {
      throw new Error('SMTP service not initialized');
    }

    return this.smtpService.sendEmail(emailOptions);
  }

  async sendBulkEmails(emailList, options) {
    if (!this.smtpService) {
      throw new Error('SMTP service not initialized');
    }

    return this.smtpService.sendBulkEmails(emailList, options);
  }

  async sendTemplatedEmail(templateOptions) {
    if (!this.smtpService) {
      throw new Error('SMTP service not initialized');
    }

    return this.smtpService.sendTemplatedEmail(templateOptions);
  }

  /**
   * Utility Methods
   */

  async testAllConnections() {
    const results = {};

    if (this.imapService) {
      try {
        await this.imapService.connect();
        results.imap = { success: true, message: 'IMAP connection successful' };
      } catch (error) {
        results.imap = { success: false, message: error.message };
      }
    }

    if (this.pop3Service) {
      try {
        await this.pop3Service.connect();
        results.pop3 = { success: true, message: 'POP3 connection successful' };
      } catch (error) {
        results.pop3 = { success: false, message: error.message };
      }
    }

    if (this.smtpService) {
      results.smtp = await this.smtpService.testConnection();
    }

    return results;
  }

  getServiceStatus() {
    return {
      imap: this.imapService ? this.imapService.getStatus() : null,
      pop3: this.pop3Service ? this.pop3Service.getStatus() : null,
      smtp: this.smtpService ? this.smtpService.getStats() : null
    };
  }

  /**
   * Cleanup and disconnect all services
   */
  async disconnect() {
    const promises = [];

    if (this.imapService) {
      promises.push(Promise.resolve(this.imapService.disconnect()));
    }

    if (this.pop3Service) {
      promises.push(Promise.resolve(this.pop3Service.disconnect()));
    }

    if (this.smtpService) {
      promises.push(this.smtpService.disconnect());
    }

    await Promise.all(promises);
    logger.info('All email services disconnected');
    this.emit('disconnected');
  }
}

module.exports = EmailService;