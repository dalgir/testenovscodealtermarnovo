/**
 * SMTP Email Sending Service
 * Handles email composition and delivery with attachments
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class SmtpService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.transporter = null;
    this.isConnected = false;
    this.rateLimiter = {
      count: 0,
      resetTime: Date.now() + (config.settings?.rateLimit?.timeWindow || 3600000)
    };
  }

  /**
   * Create and verify SMTP connection
   */
  async connect() {
    try {
      this.transporter = nodemailer.createTransporter({
        ...this.config,
        pool: true, // Use connection pooling
        maxConnections: this.config.settings?.maxConnections || 5,
        maxMessages: 100, // Max messages per connection
        rateDelta: 1000, // 1 second between messages
        rateLimit: 10 // Max 10 messages per rateDelta
      });

      // Verify connection
      await this.transporter.verify();
      
      this.isConnected = true;
      logger.info('SMTP connection established and verified');
      this.emit('connected');
      
      return true;
    } catch (error) {
      logger.error('SMTP connection failed:', error);
      this.isConnected = false;
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.count = 0;
      this.rateLimiter.resetTime = now + (this.config.settings?.rateLimit?.timeWindow || 3600000);
    }

    const maxEmails = this.config.settings?.rateLimit?.maxEmails || 100;
    
    if (this.rateLimiter.count >= maxEmails) {
      const timeLeft = Math.ceil((this.rateLimiter.resetTime - now) / 1000 / 60);
      throw new Error(`Rate limit exceeded. Try again in ${timeLeft} minutes.`);
    }

    this.rateLimiter.count++;
  }

  /**
   * Send a single email
   */
  async sendEmail(emailOptions) {
    if (!this.isConnected) {
      throw new Error('SMTP not connected');
    }

    // Check rate limiting
    this.checkRateLimit();

    try {
      // Validate required fields
      this.validateEmailOptions(emailOptions);

      // Prepare email data
      const mailOptions = await this.prepareMailOptions(emailOptions);

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully: ${info.messageId}`);
      this.emit('emailSent', {
        messageId: info.messageId,
        to: emailOptions.to,
        subject: emailOptions.subject
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope
      };

    } catch (error) {
      logger.error('Failed to send email:', error);
      this.emit('emailError', {
        error: error.message,
        to: emailOptions.to,
        subject: emailOptions.subject
      });
      throw error;
    }
  }

  /**
   * Send bulk emails with rate limiting
   */
  async sendBulkEmails(emailList, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000; // 1 second between batches

    logger.info(`Starting bulk email send: ${emailList.length} emails`);

    for (let i = 0; i < emailList.length; i += batchSize) {
      const batch = emailList.slice(i, i + batchSize);
      const batchPromises = batch.map(async (emailOptions, index) => {
        try {
          const result = await this.sendEmail(emailOptions);
          return { index: i + index, success: true, result };
        } catch (error) {
          return { index: i + index, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.value || r.reason));

      // Emit progress
      this.emit('bulkProgress', {
        completed: Math.min(i + batchSize, emailList.length),
        total: emailList.length,
        batchResults
      });

      // Delay between batches (except for the last batch)
      if (i + batchSize < emailList.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info(`Bulk email completed: ${successful} successful, ${failed} failed`);
    
    return {
      total: emailList.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Validate email options
   */
  validateEmailOptions(options) {
    if (!options.to) {
      throw new Error('Recipient email address is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.text && !options.html) {
      throw new Error('Email content (text or html) is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }

  /**
   * Prepare mail options with attachments
   */
  async prepareMailOptions(emailOptions) {
    const mailOptions = {
      from: emailOptions.from || this.config.auth.user,
      to: emailOptions.to,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
      replyTo: emailOptions.replyTo,
      priority: emailOptions.priority || 'normal',
      headers: emailOptions.headers || {}
    };

    // Handle attachments
    if (emailOptions.attachments && emailOptions.attachments.length > 0) {
      mailOptions.attachments = await this.processAttachments(emailOptions.attachments);
    }

    return mailOptions;
  }

  /**
   * Process email attachments
   */
  async processAttachments(attachments) {
    const processedAttachments = [];

    for (const attachment of attachments) {
      try {
        if (attachment.path) {
          // File path attachment
          const stats = await fs.stat(attachment.path);
          if (stats.size > 25 * 1024 * 1024) { // 25MB limit
            throw new Error(`Attachment ${attachment.filename} exceeds 25MB limit`);
          }

          processedAttachments.push({
            filename: attachment.filename || path.basename(attachment.path),
            path: attachment.path,
            contentType: attachment.contentType
          });

        } else if (attachment.content) {
          // Buffer or string content
          processedAttachments.push({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
            encoding: attachment.encoding || 'base64'
          });

        } else if (attachment.href) {
          // URL attachment
          processedAttachments.push({
            filename: attachment.filename,
            href: attachment.href,
            contentType: attachment.contentType
          });
        }

      } catch (error) {
        logger.error(`Failed to process attachment ${attachment.filename}:`, error);
        throw new Error(`Attachment processing failed: ${error.message}`);
      }
    }

    logger.info(`Processed ${processedAttachments.length} attachments`);
    return processedAttachments;
  }

  /**
   * Create HTML email template
   */
  createHtmlTemplate(options) {
    const {
      title,
      content,
      footer = '',
      styles = {}
    } = options;

    const defaultStyles = {
      container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;',
      header: 'background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;',
      content: 'background-color: #ffffff; padding: 30px; border: 1px solid #dee2e6;',
      footer: 'background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px;',
      ...styles
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8f9fa;">
        <div style="${defaultStyles.container}">
          ${title ? `<div style="${defaultStyles.header}"><h1>${title}</h1></div>` : ''}
          <div style="${defaultStyles.content}">
            ${content}
          </div>
          ${footer ? `<div style="${defaultStyles.footer}">${footer}</div>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(templateOptions) {
    const html = this.createHtmlTemplate(templateOptions);
    
    return this.sendEmail({
      ...templateOptions,
      html
    });
  }

  /**
   * Get delivery status (if supported by provider)
   */
  async getDeliveryStatus(messageId) {
    // This would require additional setup with email service providers
    // that support delivery status notifications (DSN)
    logger.info(`Checking delivery status for message: ${messageId}`);
    
    // Placeholder implementation
    return {
      messageId,
      status: 'unknown',
      message: 'Delivery status tracking not implemented'
    };
  }

  /**
   * Test SMTP configuration
   */
  async testConnection() {
    try {
      await this.connect();
      
      // Send test email
      const testResult = await this.sendEmail({
        to: this.config.auth.user,
        subject: 'SMTP Test Email',
        text: 'This is a test email to verify SMTP configuration.',
        html: '<p>This is a <strong>test email</strong> to verify SMTP configuration.</p>'
      });

      logger.info('SMTP test successful');
      return {
        success: true,
        message: 'SMTP configuration is working correctly',
        messageId: testResult.messageId
      };

    } catch (error) {
      logger.error('SMTP test failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      connected: this.isConnected,
      rateLimiter: {
        count: this.rateLimiter.count,
        resetTime: new Date(this.rateLimiter.resetTime),
        remaining: Math.max(0, (this.config.settings?.rateLimit?.maxEmails || 100) - this.rateLimiter.count)
      }
    };
  }

  /**
   * Close SMTP connection
   */
  async disconnect() {
    if (this.transporter) {
      this.transporter.close();
      this.isConnected = false;
      logger.info('SMTP connection closed');
      this.emit('disconnected');
    }
  }
}

module.exports = SmtpService;