/**
 * MPLP Hello World Example
 * 
 * This is the simplest possible MPLP application.
 * It demonstrates the basic initialization and module access.
 * 
 * Perfect for getting started with MPLP in 5 minutes!
 */

import { quickStart } from '../../../src/index';

async function main() {
  console.log('🚀 MPLP Hello World Example');
  console.log('============================\n');

  // Step 1: Initialize MPLP with quickStart()
  console.log('Step 1: Initializing MPLP...');
  const mplp = await quickStart();
  console.log('✅ MPLP initialized successfully!\n');

  // Step 2: Check available modules
  console.log('Step 2: Checking available modules...');
  const modules = mplp.getAvailableModules();
  console.log(`✅ Found ${modules.length} modules:`, modules.join(', '));
  console.log();

  // Step 3: Get a specific module
  console.log('Step 3: Accessing Context module...');
  const contextModule = mplp.getModule('context');
  console.log('✅ Context module loaded:', typeof contextModule);
  console.log();

  // Step 4: Check configuration
  console.log('Step 4: Checking configuration...');
  const config = mplp.getConfig();
  console.log('✅ Configuration:');
  console.log(`   - Environment: ${config.environment}`);
  console.log(`   - Log Level: ${config.logLevel}`);
  console.log(`   - Protocol Version: ${config.protocolVersion}`);
  console.log();

  // Step 5: Verify initialization status
  console.log('Step 5: Verifying initialization...');
  const isInitialized = mplp.isInitialized();
  console.log(`✅ MPLP is initialized: ${isInitialized}`);
  console.log();

  console.log('🎉 Hello World example completed successfully!');
  console.log('📚 Next steps:');
  console.log('   - Run: npm run example:modules (to explore module access)');
  console.log('   - Run: npm run example:config (to see custom configuration)');
  console.log('   - Read: docs/en/developers/quick-start.md');
}

// Run the example
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

