/**
 * @fileoverview Generate command for creating code from templates
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';
import { CodeGeneratorManager } from '../generators/CodeGeneratorManager';

/**
 * Generate command for creating code from templates
 */
export class GenerateCommand extends BaseCommand {
  public readonly name = 'generate';
  public readonly description = 'Generate code from templates';
  public readonly aliases = ['gen', 'g'];
  
  public readonly arguments = [
    {
      name: 'type',
      description: 'Type of code to generate (agent, workflow, config)',
      required: true
    },
    {
      name: 'name',
      description: 'Name of the generated item',
      required: false
    }
  ];

  public readonly options = [
    {
      flags: '-n, --name <name>',
      description: 'Name of the generated item'
    },
    {
      flags: '-d, --directory <directory>',
      description: 'Output directory (relative to src/)'
    },
    {
      flags: '--template <template>',
      description: 'Template variant to use',
      choices: ['basic', 'advanced', 'enterprise']
    },
    {
      flags: '--description <description>',
      description: 'Description for the generated item'
    },
    {
      flags: '--capabilities <capabilities>',
      description: 'Comma-separated list of capabilities (for agents)'
    },
    {
      flags: '--steps <steps>',
      description: 'Comma-separated list of steps (for workflows)'
    },
    {
      flags: '--no-test',
      description: 'Skip test file generation'
    },
    {
      flags: '--no-docs',
      description: 'Skip documentation generation'
    },
    {
      flags: '--typescript',
      description: 'Generate TypeScript files (default)'
    },
    {
      flags: '--javascript',
      description: 'Generate JavaScript files'
    },
    {
      flags: '--dry-run',
      description: 'Show what would be generated without creating files'
    }
  ];

  public readonly examples = [
    'mplp generate agent GreetingAgent',
    'mplp generate agent CustomerService --capabilities "greet,help,escalate"',
    'mplp generate workflow ProcessOrder --steps "validate,process,notify"',
    'mplp generate agent DataProcessor --template advanced --directory agents/data',
    'mplp generate workflow --name ContentWorkflow --template enterprise',
    'mplp generate config --name production'
  ];

  private generatorManager: CodeGeneratorManager;

  constructor(context: any) {
    super(context);
    this.generatorManager = new CodeGeneratorManager();
  }

  /**
   * Execute the generate command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get generation options
      const options = await this.getGenerationOptions(args);
      
      // Validate options
      this.validateGenerationOptions(options);
      
      // Show dry run if requested
      if (options.dryRun) {
        await this.showDryRun(options);
        return;
      }
      
      // Generate code
      await this.generateCode(options);
      
      // Show success message
      this.showSuccessMessage(options);
      
    } catch (error) {
      throw new ProjectCreationError((error as Error).message, error as Error);
    }
  }

  /**
   * Validate we're in a project directory
   */
  private async validateProjectDirectory(): Promise<void> {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('Not in a project directory. Run this command from the root of an MPLP project.');
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const hasMPLPDeps = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }).some(dep => dep.startsWith('@mplp/'));

    if (!hasMPLPDeps) {
      this.warn('This doesn\'t appear to be an MPLP project. Generated code may not work correctly.');
    }
  }

  /**
   * Get generation options from arguments and prompts
   */
  private async getGenerationOptions(args: CLICommandArgs): Promise<any> {
    let type = this.getArgument(args, 0);
    let name = this.getArgument(args, 1) || this.getOption<string>(args, 'name');
    
    // Prompt for type if not provided
    if (!type) {
      type = await this.select('What would you like to generate?', [
        'agent',
        'workflow',
        'config'
      ]);
    }

    // Validate type
    if (!['agent', 'workflow', 'config'].includes(type)) {
      throw new Error(`Invalid generation type '${type}'. Must be one of: agent, workflow, config`);
    }

    // Prompt for name if not provided
    if (!name) {
      const defaultName = type === 'agent' ? 'MyAgent' : 
                         type === 'workflow' ? 'MyWorkflow' : 
                         'MyConfig';
      name = await this.prompt(`${type.charAt(0).toUpperCase() + type.slice(1)} name:`, defaultName);
    }

    // Get other options
    const directory = this.getOption<string>(args, 'directory');
    const template = this.getOption<string>(args, 'template', 'basic');
    const description = this.getOption<string>(args, 'description') || `A ${type} generated by MPLP CLI`;
    const capabilities = this.getOption<string>(args, 'capabilities');
    const steps = this.getOption<string>(args, 'steps');
    const generateTest = !this.hasOption(args, 'no-test');
    const generateDocs = !this.hasOption(args, 'no-docs');
    const useTypeScript = !this.hasOption(args, 'javascript');
    const dryRun = this.hasOption(args, 'dry-run');

    return {
      type,
      name,
      directory,
      template,
      description,
      capabilities: capabilities ? capabilities.split(',').map(c => c.trim()) : [],
      steps: steps ? steps.split(',').map(s => s.trim()) : [],
      generateTest,
      generateDocs,
      useTypeScript,
      dryRun
    };
  }

  /**
   * Validate generation options
   */
  private validateGenerationOptions(options: any): void {
    // Validate name
    if (!options.name || options.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Validate name format
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(options.name)) {
      throw new Error('Name must start with a letter and contain only letters and numbers');
    }

    // Validate template
    if (!['basic', 'advanced', 'enterprise'].includes(options.template)) {
      throw new Error(`Invalid template '${options.template}'. Must be one of: basic, advanced, enterprise`);
    }

    // Type-specific validations
    if (options.type === 'agent' && options.capabilities.length === 0) {
      this.warn('No capabilities specified. Agent will be generated with a default capability.');
    }

    if (options.type === 'workflow' && options.steps.length === 0) {
      this.warn('No steps specified. Workflow will be generated with default steps.');
    }
  }

  /**
   * Show dry run output
   */
  private async showDryRun(options: any): Promise<void> {
    this.logger.header('Dry Run - Files that would be generated:');
    
    const files = await this.generatorManager.getGeneratedFiles(options);
    
    for (const file of files) {
      this.logger.log(`  ${file.path}`);
      if (file.description) {
        this.logger.log(`    ${this.logger.colored('gray', file.description)}`);
      }
    }
    
    this.logger.newline();
    this.logger.info('Run without --dry-run to generate these files.');
  }

  /**
   * Generate code
   */
  private async generateCode(options: any): Promise<void> {
    this.logger.header(`Generating ${options.type}: ${options.name}`);
    this.logger.info(`Template: ${options.template}`);
    this.logger.info(`Language: ${options.useTypeScript ? 'TypeScript' : 'JavaScript'}`);
    this.logger.newline();

    // Generate files
    await this.executeWithSpinner(
      () => this.generatorManager.generateCode(options),
      'Generating code files...',
      'Code files generated'
    );

    // Generate tests if requested
    if (options.generateTest) {
      await this.executeWithSpinner(
        () => this.generatorManager.generateTests(options),
        'Generating test files...',
        'Test files generated'
      );
    }

    // Generate documentation if requested
    if (options.generateDocs) {
      await this.executeWithSpinner(
        () => this.generatorManager.generateDocumentation(options),
        'Generating documentation...',
        'Documentation generated'
      );
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(options: any): void {
    this.logger.newline();
    this.success(`${options.type.charAt(0).toUpperCase() + options.type.slice(1)} '${options.name}' generated successfully!`);
    this.logger.newline();
    
    this.logger.subheader('Next steps:');
    
    if (options.type === 'agent') {
      this.logger.commands([
        { command: `# Import and use your agent`, description: 'Add to your application' },
        { command: `npm test`, description: 'Run tests to verify generation' },
        { command: `# Implement your agent capabilities`, description: 'Add business logic' }
      ]);
    } else if (options.type === 'workflow') {
      this.logger.commands([
        { command: `# Register your workflow`, description: 'Add to orchestrator' },
        { command: `npm test`, description: 'Run tests to verify generation' },
        { command: `# Define workflow steps`, description: 'Implement step logic' }
      ]);
    } else if (options.type === 'config') {
      this.logger.commands([
        { command: `# Use your configuration`, description: 'Import in your application' },
        { command: `# Set environment variables`, description: 'Configure for your environment' }
      ]);
    }
    
    this.logger.newline();
    this.logger.info('Generated files are ready for customization!');
  }
}
