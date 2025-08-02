/**
 * IMAP Email Reception Service
 * Recommended for maintaining email sync across multiple devices
 */

const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class ImapService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.imap = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.settings?.retryAttempts || 3;
    this.reconnectDelay = config.settings?.retryDelay || 5000;
  }

  /**
   * Connect to IMAP server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.imap = new Imap(this.config);

        this.imap.once('ready', () => {
          logger.info('IMAP connection established');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.imap.once('error', (err) => {
          logger.error('IMAP connection error:', err);
          this.isConnected = false;
          this.emit('error', err);
          
          // Attempt reconnection
          this.handleReconnection();
          reject(err);
        });

        this.imap.once('end', () => {
          logger.info('IMAP connection ended');
          this.isConnected = false;
          this.emit('disconnected');
          
          // Attempt reconnection if not intentional
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnection();
          }
        });

        this.imap.connect();
      } catch (error) {
        logger.error('Failed to create IMAP connection:', error);
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
   * Open a mailbox
   */
  async openBox(boxName = 'INBOX', readOnly = false) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.openBox(boxName, readOnly, (err, box) => {
        if (err) {
          logger.error(`Failed to open mailbox ${boxName}:`, err);
          reject(err);
          return;
        }

        logger.info(`Opened mailbox: ${boxName}, Messages: ${box.messages.total}`);
        resolve(box);
      });
    });
  }

  /**
   * Search for emails with criteria
   */
  async searchEmails(criteria = ['UNSEEN']) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.search(criteria, (err, results) => {
        if (err) {
          logger.error('Email search failed:', err);
          reject(err);
          return;
        }

        logger.info(`Found ${results.length} emails matching criteria`);
        resolve(results);
      });
    });
  }

  /**
   * Fetch and parse emails
   */
  async fetchEmails(uids, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      if (!uids || uids.length === 0) {
        resolve([]);
        return;
      }

      const emails = [];
      const fetchOptions = {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true,
        ...options
      };

      const fetch = this.imap.fetch(uids, fetchOptions);

      fetch.on('message', (msg, seqno) => {
        const email = { seqno, uid: null, headers: {}, body: '', attachments: [] };

        msg.on('body', (stream, info) => {
          let buffer = '';
          
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', () => {
            if (info.which === 'TEXT') {
              email.body = buffer;
            } else {
              // Parse headers
              const parsed = Imap.parseHeader(buffer);
              email.headers = parsed;
            }
          });
        });

        msg.once('attributes', (attrs) => {
          email.uid = attrs.uid;
          email.flags = attrs.flags;
          email.date = attrs.date;
          email.size = attrs.size;
        });

        msg.once('end', () => {
          emails.push(email);
        });
      });

      fetch.once('error', (err) => {
        logger.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        logger.info(`Fetched ${emails.length} emails`);
        resolve(emails);
      });
    });
  }

  /**
   * Fetch full email content including body and attachments
   */
  async fetchFullEmail(uid) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      const fetch = this.imap.fetch(uid, {
        bodies: '',
        struct: true
      });

      fetch.on('message', (msg, seqno) => {
        msg.on('body', (stream, info) => {
          simpleParser(stream, (err, parsed) => {
            if (err) {
              logger.error('Email parsing error:', err);
              reject(err);
              return;
            }

            const email = {
              uid: uid,
              seqno: seqno,
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
              headers: parsed.headers
            };

            logger.info(`Parsed email: ${email.subject}`);
            resolve(email);
          });
        });
      });

      fetch.once('error', (err) => {
        logger.error('Fetch full email error:', err);
        reject(err);
      });
    });
  }

  /**
   * Mark emails as read
   */
  async markAsRead(uids) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.addFlags(uids, ['\\Seen'], (err) => {
        if (err) {
          logger.error('Failed to mark emails as read:', err);
          reject(err);
          return;
        }

        logger.info(`Marked ${uids.length} emails as read`);
        resolve();
      });
    });
  }

  /**
   * Move emails to folder
   */
  async moveEmails(uids, targetFolder) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.move(uids, targetFolder, (err) => {
        if (err) {
          logger.error(`Failed to move emails to ${targetFolder}:`, err);
          reject(err);
          return;
        }

        logger.info(`Moved ${uids.length} emails to ${targetFolder}`);
        resolve();
      });
    });
  }

  /**
   * Delete emails
   */
  async deleteEmails(uids) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.addFlags(uids, ['\\Deleted'], (err) => {
        if (err) {
          logger.error('Failed to mark emails for deletion:', err);
          reject(err);
          return;
        }

        this.imap.expunge((expungeErr) => {
          if (expungeErr) {
            logger.error('Failed to expunge deleted emails:', expungeErr);
            reject(expungeErr);
            return;
          }

          logger.info(`Deleted ${uids.length} emails`);
          resolve();
        });
      });
    });
  }

  /**
   * Get mailbox list
   */
  async getMailboxes() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('IMAP not connected'));
        return;
      }

      this.imap.getBoxes((err, boxes) => {
        if (err) {
          logger.error('Failed to get mailboxes:', err);
          reject(err);
          return;
        }

        resolve(boxes);
      });
    });
  }

  /**
   * Monitor mailbox for new emails
   */
  startMonitoring(boxName = 'INBOX') {
    if (!this.isConnected) {
      throw new Error('IMAP not connected');
    }

    this.openBox(boxName, false).then(() => {
      this.imap.on('mail', (numNewMsgs) => {
        logger.info(`${numNewMsgs} new email(s) received`);
        this.emit('newMail', numNewMsgs);
      });

      this.imap.on('update', (seqno, info) => {
        logger.info(`Email ${seqno} updated:`, info);
        this.emit('emailUpdate', seqno, info);
      });

      this.imap.on('expunge', (seqno) => {
        logger.info(`Email ${seqno} expunged`);
        this.emit('emailExpunged', seqno);
      });

      logger.info(`Started monitoring mailbox: ${boxName}`);
    }).catch(err => {
      logger.error('Failed to start monitoring:', err);
      this.emit('error', err);
    });
  }

  /**
   * Disconnect from IMAP server
   */
  disconnect() {
    if (this.imap && this.isConnected) {
      this.imap.end();
      logger.info('IMAP disconnected');
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

module.exports = ImapService;