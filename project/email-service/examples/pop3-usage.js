/**
 * POP3 Usage Examples
 * Best for simple download-and-delete scenarios
 */

require('dotenv').config();
const EmailService = require('../EmailService');
const logger = require('../utils/logger');

async function pop3UsageExamples() {
  const emailService = new EmailService('gmail');

  try {
    // Initialize only POP3 service
    await emailService.initialize(['pop3']);

    // Example 1: Get email statistics
    console.log('\n=== Getting Email Statistics ===');
    const stats = await emailService.getEmailStatsPop3();
    console.log(`Total emails: ${stats.count}`);
    console.log(`Total size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Example 2: Download all emails (without deleting)
    console.log('\n=== Downloading All Emails (Keep on Server) ===');
    
    // Set up progress monitoring
    emailService.on('downloadProgress', (progress) => {
      const percentage = ((progress.current / progress.total) * 100).toFixed(1);
      console.log(`Progress: ${progress.current}/${progress.total} (${percentage}%) - ${progress.email.subject}`);
    });

    const emails = await emailService.downloadAllEmailsPop3(false); // false = don't delete
    console.log(`Downloaded ${emails.length} emails`);

    // Display summary of downloaded emails
    emails.forEach((email, index) => {
      console.log(`${index + 1}. From: ${email.from?.text || 'Unknown'}`);
      console.log(`   Subject: ${email.subject || 'No Subject'}`);
      console.log(`   Date: ${email.date || 'Unknown'}`);
      console.log(`   Size: ${(email.size / 1024).toFixed(2)} KB`);
      console.log(`   Attachments: ${email.attachments?.length || 0}`);
      console.log('---');
    });

    // Example 3: Process emails and save attachments
    console.log('\n=== Processing Emails and Attachments ===');
    const fs = require('fs').promises;
    const path = require('path');

    // Create attachments directory
    const attachmentsDir = path.join(__dirname, 'downloaded-attachments');
    try {
      await fs.mkdir(attachmentsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    let attachmentCount = 0;
    for (const email of emails) {
      if (email.attachments && email.attachments.length > 0) {
        console.log(`Processing attachments from: ${email.subject}`);
        
        for (const attachment of email.attachments) {
          try {
            const filename = attachment.filename || `attachment_${Date.now()}`;
            const filepath = path.join(attachmentsDir, filename);
            
            await fs.writeFile(filepath, attachment.content);
            console.log(`  Saved: ${filename} (${attachment.size} bytes)`);
            attachmentCount++;
          } catch (error) {
            console.error(`  Failed to save attachment: ${error.message}`);
          }
        }
      }
    }
    console.log(`Total attachments saved: ${attachmentCount}`);

    // Example 4: Filter emails by criteria
    console.log('\n=== Filtering Emails ===');
    
    // Filter emails from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentEmails = emails.filter(email => {
      return email.date && new Date(email.date) > yesterday;
    });
    console.log(`Emails from last 24 hours: ${recentEmails.length}`);

    // Filter emails with attachments
    const emailsWithAttachments = emails.filter(email => {
      return email.attachments && email.attachments.length > 0;
    });
    console.log(`Emails with attachments: ${emailsWithAttachments.length}`);

    // Filter emails by sender domain
    const gmailEmails = emails.filter(email => {
      return email.from?.text?.includes('@gmail.com');
    });
    console.log(`Emails from Gmail: ${gmailEmails.length}`);

    // Example 5: Download and delete emails (use with caution!)
    console.log('\n=== Download and Delete Example (Commented Out) ===');
    console.log('Uncomment the following code to download and delete emails:');
    console.log('// const deletedEmails = await emailService.downloadAllEmailsPop3(true);');
    console.log('// console.log(`Downloaded and deleted ${deletedEmails.length} emails`);');
    
    // CAUTION: This will delete emails from the server!
    // const deletedEmails = await emailService.downloadAllEmailsPop3(true);
    // console.log(`Downloaded and deleted ${deletedEmails.length} emails`);

  } catch (error) {
    logger.error('Error in POP3 usage examples:', error);
    console.error('Error:', error.message);
  } finally {
    // Always disconnect
    await emailService.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});

// Run examples
if (require.main === module) {
  pop3UsageExamples();
}

module.exports = pop3UsageExamples;