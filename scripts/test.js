#!/usr/bin/env node

/**
 * MPLP Test Script
 * Simple test runner for public releases
 */

const { execSync } = require('child_process');

console.log('🧪 Running MPLP tests...');

try {
  // Run Jest tests
  console.log('🔍 Running unit and integration tests...');
  execSync('npx jest', { stdio: 'inherit' });

  console.log('✅ All tests passed!');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
