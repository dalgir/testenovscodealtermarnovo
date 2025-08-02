/**
 * POP3 Email Reception Service
 * Best for simple download-and-delete scenarios
 */

const POP3Client = require('poplib');
const { simpleParser } = require('mailparser');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class Pop3Service extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.settings?.retryAttempts || 3;
    this.reconnectDelay = config.settings?.retryDelay || 5000;
  }

  /**
   * Connect to POP3 server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new POP3Client(
          this.config.port,
          this.config.host,
          {
            tlserrs: false,
            enabletls: this.config.secure,
            debug: this.config.debug || false
          }
        );

        this.client.on('connect', () => {
          logger.info('POP3 connection established');
          
          // Authenticate
          this.client.login(this.config.auth.user, this.config.auth.pass);
        });

        this.client.on('login', (status, data) => {
          if (status) {
            logger.info('POP3 authentication successful');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
            resolve();
          } else {
            const error = new Error(`POP3 authentication failed: ${data}`);
            logger.error('POP3 authentication failed:', data);
            this.emit('error', error);
            reject(error);
          }
        });

        this.client.on('error', (err) => {
          logger.error('POP3 connection error:', err);
          this.isConnected = false;
          this.emit('error', err);
          
          // Attempt reconnection
          this.handleReconnection();
          reject(err);
        });

        this.client.on('close', () => {
          logger.info('POP3 connection closed');
          this.isConnected = false;
          this.emit('disconnected');
          
          // Attempt reconnection if not intentional
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnection();
          }
        });

      } catch (error) {
        logger.error('Failed to create POP3 connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(err => {
        logger.error('Reconnection failed:', err);
      });
    }, this.reconnectDelay);
  }

  /**
   * Get email count and total size
   */
  async getEmailStats() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.stat();

      this.client.on('stat', (status, data) => {
        if (status) {
          const [count, size] = data.split(' ').map(Number);
          logger.info(`Email stats: ${count} messages, ${size} bytes total`);
          resolve({ count, size });
        } else {
          const error = new Error(`Failed to get email stats: ${data}`);
          logger.error('Failed to get email stats:', data);
          reject(error);
        }
      });
    });
  }

  /**
   * Get list of emails with sizes
   */
  async getEmailList() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.list();

      this.client.on('list', (status, data) => {
        if (status) {
          const emails = data.split('\r\n')
            .filter(line => line.trim())
            .map(line => {
              const [id, size] = line.split(' ').map(Number);
              return { id, size };
            });
          
          logger.info(`Retrieved list of ${emails.length} emails`);
          resolve(emails);
        } else {
          const error = new Error(`Failed to get email list: ${data}`);
          logger.error('Failed to get email list:', data);
          reject(error);
        }
      });
    });
  }

  /**
   * Retrieve email headers
   */
  async getEmailHeaders(emailId, lines = 0) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.top(emailId, lines);

      this.client.on('top', (status, data) => {
        if (status) {
          simpleParser(data, (err, parsed) => {
            if (err) {
              logger.error('Email header parsing error:', err);
              reject(err);
              return;
            }

            const headers = {
              messageId: parsed.messageId,
              from: parsed.from,
              to: parsed.to,
              subject: parsed.subject,
              date: parsed.date,
              size: data.length
            };

            logger.info(`Retrieved headers for email ${emailId}: ${headers.subject}`);
            resolve(headers);
          });
        } else {
          const error = new Error(`Failed to get email headers: ${data}`);
          logger.error(`Failed to get email headers for ${emailId}:`, data);
          reject(error);
        }
      });
    });
  }

  /**
   * Retrieve full email content
   */
  async getFullEmail(emailId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.retr(emailId);

      this.client.on('retr', (status, data) => {
        if (status) {
          simpleParser(data, (err, parsed) => {
            if (err) {
              logger.error('Email parsing error:', err);
              reject(err);
              return;
            }

            const email = {
              id: emailId,
              messageId: parsed.messageId,
              from: parsed.from,
              to: parsed.to,
              cc: parsed.cc,
              bcc: parsed.bcc,
              subject: parsed.subject,
              date: parsed.date,
              text: parsed.text,
              html: parsed.html,
              attachments: parsed.attachments || [],
              headers: parsed.headers,
              size: data.length
            };

            logger.info(`Retrieved full email ${emailId}: ${email.subject}`);
            resolve(email);
          });
        } else {
          const error = new Error(`Failed to retrieve email: ${data}`);
          logger.error(`Failed to retrieve email ${emailId}:`, data);
          reject(error);
        }
      });
    });
  }

  /**
   * Delete email from server
   */
  async deleteEmail(emailId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.dele(emailId);

      this.client.on('dele', (status, data) => {
        if (status) {
          logger.info(`Deleted email ${emailId}`);
          resolve();
        } else {
          const error = new Error(`Failed to delete email: ${data}`);
          logger.error(`Failed to delete email ${emailId}:`, data);
          reject(error);
        }
      });
    });
  }

  /**
   * Reset deleted emails (undelete)
   */
  async resetDeleted() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('POP3 not connected'));
        return;
      }

      this.client.rset();

      this.client.on('rset', (status, data) => {
        if (status) {
          logger.info('Reset deleted emails');
          resolve();
        } else {
          const error = new Error(`Failed to reset deleted emails: ${data}`);
          logger.error('Failed to reset deleted emails:', data);
          reject(error);
        }
      });
    });
  }

  /**
   * Download all emails
   */
  async downloadAllEmails(deleteAfterDownload = false) {
    try {
      const stats = await this.getEmailStats();
      const emails = [];

      for (let i = 1; i <= stats.count; i++) {
        try {
          const email = await this.getFullEmail(i);
          emails.push(email);

          if (deleteAfterDownload) {
            await this.deleteEmail(i);
          }

          // Emit progress
          this.emit('downloadProgress', {
            current: i,
            total: stats.count,
            email: email
          });

        } catch (error) {
          logger.error(`Failed to download email ${i}:`, error);
          this.emit('downloadError', { emailId: i, error });
        }
      }

      logger.info(`Downloaded ${emails.length} emails`);
      return emails;

    } catch (error) {
      logger.error('Failed to download emails:', error);
      throw error;
    }
  }

  /**
   * Disconnect from POP3 server
   */
  disconnect() {
    if (this.client && this.isConnected) {
      this.client.quit();
      logger.info('POP3 disconnected');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

module.exports = Pop3Service;