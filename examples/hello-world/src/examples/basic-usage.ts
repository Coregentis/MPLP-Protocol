/**
 * Example 1: Basic MPLP Usage
 * 
 * Demonstrates the simplest way to use MPLP with quickStart()
 */

import { quickStart } from '../../../../src/index';

async function basicUsageExample() {
  console.log('📘 Example 1: Basic MPLP Usage\n');

  // The simplest way to start MPLP
  const mplp = await quickStart();

  console.log('✅ MPLP initialized with quickStart()');
  console.log(`📦 Loaded ${mplp.getAvailableModules().length} modules`);
  console.log(`⚙️  Environment: ${mplp.getConfig().environment}`);
  console.log();

  console.log('Available modules:');
  mplp.getAvailableModules().forEach((moduleName, index) => {
    console.log(`  ${index + 1}. ${moduleName}`);
  });
}

basicUsageExample().catch(console.error);

