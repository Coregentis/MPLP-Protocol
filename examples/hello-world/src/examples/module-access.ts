/**
 * Example 2: Module Access
 * 
 * Demonstrates how to access and use MPLP modules
 */

import { quickStart } from '../../../../src/index';

async function moduleAccessExample() {
  console.log('📘 Example 2: Module Access\n');

  const mplp = await quickStart();

  console.log('Accessing MPLP modules:\n');

  // Access Context module
  console.log('1. Context Module:');
  const contextModule = mplp.getModule('context');
  console.log(`   ✅ Type: ${typeof contextModule}`);
  console.log(`   ✅ Loaded: ${contextModule !== null}`);
  console.log();

  // Access Plan module
  console.log('2. Plan Module:');
  const planModule = mplp.getModule('plan');
  console.log(`   ✅ Type: ${typeof planModule}`);
  console.log(`   ✅ Loaded: ${planModule !== null}`);
  console.log();

  // Access Role module
  console.log('3. Role Module:');
  const roleModule = mplp.getModule('role');
  console.log(`   ✅ Type: ${typeof roleModule}`);
  console.log(`   ✅ Loaded: ${roleModule !== null}`);
  console.log();

  // Access Trace module
  console.log('4. Trace Module:');
  const traceModule = mplp.getModule('trace');
  console.log(`   ✅ Type: ${typeof traceModule}`);
  console.log(`   ✅ Loaded: ${traceModule !== null}`);
  console.log();

  // Access Collab module
  console.log('5. Collab Module:');
  const collabModule = mplp.getModule('collab');
  console.log(`   ✅ Type: ${typeof collabModule}`);
  console.log(`   ✅ Loaded: ${collabModule !== null}`);
  console.log();

  console.log('✅ All modules accessed successfully!');
  console.log('💡 Tip: Use getModule<T>() for TypeScript type safety');
}

moduleAccessExample().catch(console.error);

