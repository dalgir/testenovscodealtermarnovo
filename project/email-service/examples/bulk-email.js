/**
 * Bulk Email Sending Examples
 * Demonstrates rate limiting and batch processing
 */

require('dotenv').config();
const EmailService = require('../EmailService');
const logger = require('../utils/logger');

async function bulkEmailExamples() {
  const emailService = new EmailService('gmail');

  try {
    // Initialize SMTP service
    await emailService.initialize(['smtp']);

    // Example 1: Send bulk emails with progress monitoring
    console.log('\n=== Sending Bulk Emails ===');

    // Create a list of emails to send
    const emailList = [
      {
        to: 'user1@example.com',
        subject: 'Welcome to Our Newsletter',
        html: '<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p>'
      },
      {
        to: 'user2@example.com',
        subject: 'Special Offer Just for You',
        html: '<h1>Special Offer</h1><p>Get 20% off your next purchase!</p>'
      },
      {
        to: 'user3@example.com',
        subject: 'Product Update',
        html: '<h1>Product Update</h1><p>Check out our latest features.</p>'
      },
      {
        to: 'user4@example.com',
        subject: 'Event Invitation',
        html: '<h1>You\'re Invited!</h1><p>Join us for our upcoming webinar.</p>'
      },
      {
        to: 'user5@example.com',
        subject: 'Monthly Report',
        html: '<h1>Monthly Report</h1><p>Here\'s your activity summary for this month.</p>'
      }
    ];

    // Set up progress monitoring
    emailService.on('bulkProgress', (progress) => {
      console.log(`Progress: ${progress.completed}/${progress.total} emails sent`);
      
      // Log any failures in this batch
      progress.batchResults.forEach(result => {
        if (!result.success) {
          console.error(`Failed to send email ${result.index}: ${result.error}`);
        }
      });
    });

    // Send bulk emails with custom options
    const bulkResult = await emailService.sendBulkEmails(emailList, {
      batchSize: 2,  // Send 2 emails at a time
      delay: 2000    // Wait 2 seconds between batches
    });

    console.log('\nBulk email results:');
    console.log(`Total: ${bulkResult.total}`);
    console.log(`Successful: ${bulkResult.successful}`);
    console.log(`Failed: ${bulkResult.failed}`);

    // Example 2: Personalized bulk emails
    console.log('\n=== Sending Personalized Bulk Emails ===');

    const customers = [
      { name: 'John Doe', email: 'john@example.com', plan: 'Premium' },
      { name: 'Jane Smith', email: 'jane@example.com', plan: 'Basic' },
      { name: 'Bob Johnson', email: 'bob@example.com', plan: 'Enterprise' }
    ];

    const personalizedEmails = customers.map(customer => ({
      to: customer.email,
      subject: `Hello ${customer.name}, your ${customer.plan} plan update`,
      html: `
        <h1>Hello ${customer.name}!</h1>
        <p>We hope you're enjoying your <strong>${customer.plan}</strong> plan.</p>
        <p>Here are some updates specifically for ${customer.plan} users:</p>
        <ul>
          ${customer.plan === 'Premium' ? '<li>New premium features available</li>' : ''}
          ${customer.plan === 'Enterprise' ? '<li>Enterprise dashboard updates</li>' : ''}
          <li>General improvements and bug fixes</li>
        </ul>
        <p>Best regards,<br>The Team</p>
      `
    }));

    const personalizedResult = await emailService.sendBulkEmails(personalizedEmails, {
      batchSize: 1,  // Send one at a time for personalized emails
      delay: 1000    // 1 second delay
    });

    console.log('Personalized bulk email results:', personalizedResult);

    // Example 3: Newsletter with template
    console.log('\n=== Sending Newsletter with Template ===');

    const newsletterSubscribers = [
      'subscriber1@example.com',
      'subscriber2@example.com',
      'subscriber3@example.com'
    ];

    const newsletterEmails = newsletterSubscribers.map(email => ({
      to: email,
      subject: 'Weekly Newsletter - Tech Updates',
      title: 'Weekly Tech Newsletter',
      content: `
        <h2>This Week in Tech</h2>
        <h3>🚀 Featured Article</h3>
        <p>Building Scalable Email Services with Node.js</p>
        <p>Learn how to implement robust email handling with IMAP, POP3, and SMTP protocols...</p>
        
        <h3>📰 News Highlights</h3>
        <ul>
          <li>New JavaScript features in ES2024</li>
          <li>Cloud computing trends for 2024</li>
          <li>Best practices for API security</li>
        </ul>
        
        <h3>🛠️ Tools & Resources</h3>
        <p>Check out these useful development tools:</p>
        <ul>
          <li>Node.js Email Libraries Comparison</li>
          <li>Email Testing Tools</li>
          <li>SMTP Configuration Guide</li>
        </ul>
      `,
      footer: `
        <p>You received this email because you subscribed to our newsletter.</p>
        <p><a href="#unsubscribe">Unsubscribe</a> | <a href="#preferences">Update Preferences</a></p>
      `
    }));

    // Send templated newsletters
    const newsletterPromises = newsletterEmails.map(async (emailData, index) => {
      try {
        // Add delay between sends
        await new Promise(resolve => setTimeout(resolve, index * 1000));
        
        const result = await emailService.sendTemplatedEmail(emailData);
        console.log(`Newsletter sent to ${emailData.to}: ${result.messageId}`);
        return { success: true, email: emailData.to, messageId: result.messageId };
      } catch (error) {
        console.error(`Failed to send newsletter to ${emailData.to}:`, error.message);
        return { success: false, email: emailData.to, error: error.message };
      }
    });

    const newsletterResults = await Promise.all(newsletterPromises);
    const successfulNewsletters = newsletterResults.filter(r => r.success).length;
    console.log(`Newsletter campaign completed: ${successfulNewsletters}/${newsletterResults.length} sent successfully`);

    // Example 4: Check service statistics
    console.log('\n=== Service Statistics ===');
    const stats = emailService.getServiceStatus();
    console.log('SMTP Statistics:', JSON.stringify(stats.smtp, null, 2));

  } catch (error) {
    logger.error('Error in bulk email examples:', error);
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
  bulkEmailExamples();
}

module.exports = bulkEmailExamples;