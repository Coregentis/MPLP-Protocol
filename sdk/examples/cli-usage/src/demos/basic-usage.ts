/**
 * @fileoverview Basic CLI Usage Demo
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import { CLIUsageDemo } from './CLIUsageDemo';

/**
 * Basic CLI usage demonstration
 */
async function runBasicUsageDemo(): Promise<void> {
  console.log(chalk.blue.bold('🎯 MPLP CLI Basic Usage Demo'));
  console.log(chalk.gray('Demonstrating basic CLI commands and workflows\n'));

  try {
    const demo = new CLIUsageDemo();
    
    // Run basic template demo only
    console.log(chalk.yellow('Running basic template demonstration...'));
    await demo.demoBasicTemplate();
    
    console.log(chalk.green.bold('\n✅ Basic usage demo completed successfully!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  • Try the advanced demo: npm run demo:advanced'));
    console.log(chalk.gray('  • Try the enterprise demo: npm run demo:enterprise'));
    console.log(chalk.gray('  • Run all demos: npm run demo:all'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Basic usage demo failed:'), error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runBasicUsageDemo().catch(error => {
    console.error(chalk.red.bold('❌ Demo execution failed:'), error);
    process.exit(1);
  });
}

export { runBasicUsageDemo };
