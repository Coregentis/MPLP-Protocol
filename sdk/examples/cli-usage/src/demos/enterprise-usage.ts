/**
 * @fileoverview Enterprise CLI Usage Demo
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import { CLIUsageDemo } from './CLIUsageDemo';

/**
 * Enterprise CLI usage demonstration
 */
async function runEnterpriseUsageDemo(): Promise<void> {
  console.log(chalk.blue.bold('🏢 MPLP CLI Enterprise Usage Demo'));
  console.log(chalk.gray('Demonstrating enterprise-grade CLI features and workflows\n'));

  try {
    const demo = new CLIUsageDemo();
    
    // Run enterprise template demo
    console.log(chalk.yellow('Running enterprise template demonstration...'));
    await demo.demoEnterpriseTemplate();
    
    // Run development workflow demo
    console.log(chalk.yellow('\nRunning development workflow demonstration...'));
    await demo.demoDevelopmentWorkflow();
    
    console.log(chalk.green.bold('\n✅ Enterprise usage demo completed successfully!'));
    console.log(chalk.gray('\nEnterprise features demonstrated:'));
    console.log(chalk.gray('  ✓ Production-ready project template'));
    console.log(chalk.gray('  ✓ Docker containerization'));
    console.log(chalk.gray('  ✓ Kubernetes deployment manifests'));
    console.log(chalk.gray('  ✓ CI/CD pipeline configuration'));
    console.log(chalk.gray('  ✓ Monitoring and observability'));
    console.log(chalk.gray('  ✓ Security hardening'));
    console.log(chalk.gray('  ✓ Development workflow automation'));
    
    console.log(chalk.gray('\nEnterprise benefits:'));
    console.log(chalk.gray('  🚀 Faster time to production'));
    console.log(chalk.gray('  🔒 Enhanced security posture'));
    console.log(chalk.gray('  📊 Built-in monitoring and metrics'));
    console.log(chalk.gray('  🔄 Automated CI/CD pipelines'));
    console.log(chalk.gray('  📈 Scalable architecture patterns'));
    
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  • Explore generated enterprise project in output/temp/'));
    console.log(chalk.gray('  • Review Docker and Kubernetes configurations'));
    console.log(chalk.gray('  • Customize CI/CD pipeline for your organization'));
    console.log(chalk.gray('  • Deploy to your enterprise infrastructure'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Enterprise usage demo failed:'), error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runEnterpriseUsageDemo().catch(error => {
    console.error(chalk.red.bold('❌ Demo execution failed:'), error);
    process.exit(1);
  });
}

export { runEnterpriseUsageDemo };
