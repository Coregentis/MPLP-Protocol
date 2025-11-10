/**
 * Example 3: Custom Configuration
 * 
 * Demonstrates different ways to configure MPLP
 */

import { MPLP, createMPLP, createProductionMPLP, createTestMPLP } from '../../../../src/index';

async function customConfigExample() {
  console.log('📘 Example 3: Custom Configuration\n');

  // Method 1: Using constructor with custom config
  console.log('1. Using MPLP constructor:');
  const mplp1 = new MPLP({
    environment: 'development',
    logLevel: 'debug',
    protocolVersion: '1.1.0-beta'
  });
  await mplp1.initialize();
  console.log(`   ✅ Environment: ${mplp1.getConfig().environment}`);
  console.log(`   ✅ Log Level: ${mplp1.getConfig().logLevel}`);
  console.log();

  // Method 2: Using createMPLP factory
  console.log('2. Using createMPLP factory:');
  const mplp2 = await createMPLP({
    environment: 'development',
    logLevel: 'info',
    modules: ['context', 'plan', 'role'] // Load only specific modules
  });
  console.log(`   ✅ Environment: ${mplp2.getConfig().environment}`);
  console.log(`   ✅ Loaded modules: ${mplp2.getAvailableModules().length}`);
  console.log();

  // Method 3: Production configuration
  console.log('3. Using createProductionMPLP:');
  const mplp3 = await createProductionMPLP();
  console.log(`   ✅ Environment: ${mplp3.getConfig().environment}`);
  console.log(`   ✅ Log Level: ${mplp3.getConfig().logLevel}`);
  console.log();

  // Method 4: Test configuration
  console.log('4. Using createTestMPLP:');
  const mplp4 = await createTestMPLP();
  console.log(`   ✅ Environment: ${mplp4.getConfig().environment}`);
  console.log(`   ✅ Log Level: ${mplp4.getConfig().logLevel}`);
  console.log();

  // Method 5: Custom module selection
  console.log('5. Custom module selection:');
  const mplp5 = await createMPLP({
    modules: ['context', 'plan', 'trace'] // Only load these 3 modules
  });
  console.log(`   ✅ Selected modules: ${mplp5.getAvailableModules().join(', ')}`);
  console.log();

  console.log('✅ All configuration methods demonstrated!');
  console.log('💡 Tip: Choose the method that best fits your use case');
}

customConfigExample().catch(console.error);

