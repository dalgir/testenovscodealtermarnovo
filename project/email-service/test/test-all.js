/**
 * Test Suite for Email Service
 * Basic tests to verify functionality
 */

require('dotenv').config();
const EmailService = require('../EmailService');
const logger = require('../utils/logger');

async function runTests() {
  console.log('🧪 Starting Email Service Tests\n');

  const tests = [
    testEmailServiceInitialization,
    testConnectionTests,
    testConfigValidation,
    testServiceStatus
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Running: ${test.name}`);
      await test();
      console.log(`✅ ${test.name} - PASSED\n`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} - FAILED`);
      console.error(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function testEmailServiceInitialization() {
  const emailService = new EmailService('gmail');
  
  // Test that service can be created
  if (!emailService) {
    throw new Error('Failed to create EmailService instance');
  }

  // Test that configurations are loaded
  if (!emailService.imapConfig || !emailService.smtpConfig) {
    throw new Error('Email configurations not loaded properly');
  }

  console.log('   ✓ EmailService instance created successfully');
  console.log('   ✓ Configurations loaded properly');
}

async function testConnectionTests() {
  const emailService = new EmailService('gmail');
  
  // Test connection testing functionality
  const results = await emailService.testAllConnections();
  
  if (!results || typeof results !== 'object') {
    throw new Error('Connection test results invalid');
  }

  console.log('   ✓ Connection test functionality works');
  console.log(`   ✓ Test results: ${Object.keys(results).join(', ')}`);
}

async function testConfigValidation() {
  // Test invalid provider
  try {
    new EmailService('invalid-provider');
    throw new Error('Should have thrown error for invalid provider');
  } catch (error) {
    if (!error.message.includes('Unsupported email provider')) {
      throw error;
    }
  }

  console.log('   ✓ Invalid provider validation works');

  // Test valid providers
  const validProviders = ['gmail', 'outlook', 'yahoo'];
  for (const provider of validProviders) {
    const service = new EmailService(provider);
    if (!service.imapConfig || !service.smtpConfig) {
      throw new Error(`Configuration missing for provider: ${provider}`);
    }
  }

  console.log('   ✓ Valid provider configurations loaded');
}

async function testServiceStatus() {
  const emailService = new EmailService('gmail');
  
  const status = emailService.getServiceStatus();
  
  if (!status || typeof status !== 'object') {
    throw new Error('Service status invalid');
  }

  // Should have status for each service type
  const expectedServices = ['imap', 'pop3', 'smtp'];
  for (const service of expectedServices) {
    if (!(service in status)) {
      throw new Error(`Missing status for service: ${service}`);
    }
  }

  console.log('   ✓ Service status functionality works');
  console.log('   ✓ All service types included in status');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = runTests;