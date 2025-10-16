/**
 * @fileoverview MPLP CLI Usage Examples - Main Entry Point
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import { CLIUsageDemo } from './demos/CLIUsageDemo';
import { ProjectInitializationExample } from './examples/ProjectInitializationExample';
import { CodeGenerationExample } from './examples/CodeGenerationExample';
import { DevelopmentWorkflowExample } from './examples/DevelopmentWorkflowExample';

/**
 * Main CLI Usage Examples Application
 */
export class CLIUsageExamplesApp {
  private readonly demo: CLIUsageDemo;
  private readonly projectExample: ProjectInitializationExample;
  private readonly codeExample: CodeGenerationExample;
  private readonly workflowExample: DevelopmentWorkflowExample;

  constructor() {
    this.demo = new CLIUsageDemo();
    this.projectExample = new ProjectInitializationExample();
    this.codeExample = new CodeGenerationExample();
    this.workflowExample = new DevelopmentWorkflowExample();
  }

  /**
   * Run all CLI usage examples
   */
  public async runAllExamples(): Promise<void> {
    console.log(chalk.blue.bold('🚀 MPLP CLI Usage Examples'));
    console.log(chalk.gray('Demonstrating MPLP CLI capabilities and best practices\n'));

    try {
      // Run project initialization examples
      console.log(chalk.yellow('📋 Step 1: Project Initialization Examples'));
      await this.projectExample.runAllExamples();
      console.log();

      // Run code generation examples
      console.log(chalk.yellow('📋 Step 2: Code Generation Examples'));
      await this.codeExample.runAllExamples();
      console.log();

      // Run development workflow examples
      console.log(chalk.yellow('📋 Step 3: Development Workflow Examples'));
      await this.workflowExample.runAllExamples();
      console.log();

      // Run interactive demos
      console.log(chalk.yellow('📋 Step 4: Interactive CLI Demos'));
      await this.demo.runAllDemos();

      console.log(chalk.green.bold('\n✅ All CLI usage examples completed successfully!'));
      console.log(chalk.gray('Check the generated projects and files in the output directory.'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Error running CLI examples:'), error);
      throw error;
    }
  }

  /**
   * Run specific example by name
   */
  public async runExample(exampleName: string): Promise<void> {
    console.log(chalk.blue.bold(`🚀 Running ${exampleName} example`));

    try {
      switch (exampleName) {
        case 'project-init':
          await this.projectExample.runAllExamples();
          break;
        case 'code-generation':
          await this.codeExample.runAllExamples();
          break;
        case 'workflow':
          await this.workflowExample.runAllExamples();
          break;
        case 'demo':
          await this.demo.runAllDemos();
          break;
        default:
          throw new Error(`Unknown example: ${exampleName}`);
      }

      console.log(chalk.green.bold(`\n✅ ${exampleName} example completed successfully!`));

    } catch (error) {
      console.error(chalk.red.bold(`❌ Error running ${exampleName} example:`), error);
      throw error;
    }
  }

  /**
   * Display available examples
   */
  public displayAvailableExamples(): void {
    console.log(chalk.blue.bold('📚 Available CLI Usage Examples:'));
    console.log();
    console.log(chalk.cyan('  project-init') + chalk.gray('     - Project initialization examples'));
    console.log(chalk.cyan('  code-generation') + chalk.gray('  - Code generation examples'));
    console.log(chalk.cyan('  workflow') + chalk.gray('         - Development workflow examples'));
    console.log(chalk.cyan('  demo') + chalk.gray('             - Interactive CLI demos'));
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log(chalk.gray('  npm run example:<name>'));
    console.log(chalk.gray('  npm run demo:<template>'));
    console.log();
  }
}

// Export main class and examples
export { CLIUsageDemo } from './demos/CLIUsageDemo';
export { ProjectInitializationExample } from './examples/ProjectInitializationExample';
export { CodeGenerationExample } from './examples/CodeGenerationExample';
export { DevelopmentWorkflowExample } from './examples/DevelopmentWorkflowExample';

// Default export
export default CLIUsageExamplesApp;

// CLI entry point
if (require.main === module) {
  const app = new CLIUsageExamplesApp();
  
  const command = process.argv[2];
  
  if (command === 'list') {
    app.displayAvailableExamples();
  } else if (command) {
    app.runExample(command).catch(error => {
      console.error(chalk.red.bold('❌ Failed to run example:'), error);
      process.exit(1);
    });
  } else {
    app.runAllExamples().catch(error => {
      console.error(chalk.red.bold('❌ Failed to run examples:'), error);
      process.exit(1);
    });
  }
}
