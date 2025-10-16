/**
 * @fileoverview Advanced CLI Usage Demo
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import { CLIUsageDemo } from './CLIUsageDemo';

/**
 * Advanced CLI usage demonstration
 */
async function runAdvancedUsageDemo(): Promise<void> {
  console.log(chalk.blue.bold('🚀 MPLP CLI Advanced Usage Demo'));
  console.log(chalk.gray('Demonstrating advanced CLI features and workflows\n'));

  try {
    const demo = new CLIUsageDemo();
    
    // Run advanced template demo
    console.log(chalk.yellow('Running advanced template demonstration...'));
    await demo.demoAdvancedTemplate();
    
    // Run code generation demo
    console.log(chalk.yellow('\nRunning code generation demonstration...'));
    await demo.demoCodeGeneration();
    
    console.log(chalk.green.bold('\n✅ Advanced usage demo completed successfully!'));
    console.log(chalk.gray('\nFeatures demonstrated:'));
    console.log(chalk.gray('  ✓ Advanced project template'));
    console.log(chalk.gray('  ✓ Code generation capabilities'));
    console.log(chalk.gray('  ✓ Multi-agent orchestration'));
    console.log(chalk.gray('  ✓ API server integration'));
    
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  • Try the enterprise demo: npm run demo:enterprise'));
    console.log(chalk.gray('  • Explore generated code in output/temp/'));
    console.log(chalk.gray('  • Run development workflow: npm run example:workflow'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Advanced usage demo failed:'), error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runAdvancedUsageDemo().catch(error => {
    console.error(chalk.red.bold('❌ Demo execution failed:'), error);
    process.exit(1);
  });
}

export { runAdvancedUsageDemo };
