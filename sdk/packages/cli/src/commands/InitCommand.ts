/**
 * @fileoverview Init command for creating new MPLP projects
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectOptions, ProjectCreationError } from '../core/types';
import { ProjectTemplateManager } from '../templates/ProjectTemplateManager';
import { PackageManagerDetector } from '../utils/PackageManagerDetector';
import { GitOperations } from '../utils/GitOperations';

/**
 * Init command for creating new MPLP projects
 */
export class InitCommand extends BaseCommand {
  public readonly name = 'init';
  public readonly description = 'Create a new MPLP project';
  public readonly aliases = ['create', 'new'];
  
  public readonly arguments = [
    {
      name: 'project-name',
      description: 'Name of the project to create',
      required: false
    }
  ];

  public readonly options = [
    {
      flags: '-t, --template <template>',
      description: 'Project template to use',
      defaultValue: 'basic',
      choices: ['basic', 'advanced', 'enterprise']
    },
    {
      flags: '-d, --directory <directory>',
      description: 'Directory to create the project in'
    },
    {
      flags: '--description <description>',
      description: 'Project description'
    },
    {
      flags: '--author <author>',
      description: 'Project author'
    },
    {
      flags: '--license <license>',
      description: 'Project license',
      defaultValue: 'MIT'
    },
    {
      flags: '--no-git',
      description: 'Skip Git repository initialization'
    },
    {
      flags: '--no-install',
      description: 'Skip dependency installation'
    },
    {
      flags: '--typescript',
      description: 'Use TypeScript template'
    },
    {
      flags: '--eslint',
      description: 'Include ESLint configuration'
    },
    {
      flags: '--prettier',
      description: 'Include Prettier configuration'
    }
  ];

  public readonly examples = [
    'mplp init my-agent',
    'mplp init my-agent --template advanced',
    'mplp init my-agent --template enterprise --typescript --eslint',
    'mplp init --directory ./projects/my-agent'
  ];

  private templateManager: ProjectTemplateManager;
  private packageManager: PackageManagerDetector;
  private gitOps: GitOperations;

  constructor(context: any) {
    super(context);
    this.templateManager = new ProjectTemplateManager();
    this.packageManager = new PackageManagerDetector();
    this.gitOps = new GitOperations();
  }

  /**
   * Execute the init command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Get project options
      const options = await this.getProjectOptions(args);
      
      // Validate options
      this.validateProjectOptions(options);
      
      // Create project
      await this.createProject(options);
      
      // Show success message
      this.showSuccessMessage(options);
      
    } catch (error) {
      throw new ProjectCreationError((error as Error).message, error as Error);
    }
  }

  /**
   * Get project options from arguments and prompts
   */
  private async getProjectOptions(args: CLICommandArgs): Promise<ProjectOptions> {
    let projectName = this.getArgument(args, 0);
    
    // Prompt for project name if not provided
    if (!projectName) {
      projectName = await this.prompt('Project name:', 'my-mplp-project');
    }

    // Get template
    const template = this.getOption<string>(args, 'template', 'basic');
    
    // Validate template
    if (!this.templateManager.hasTemplate(template)) {
      const availableTemplates = this.templateManager.getAvailableTemplates();
      throw new Error(`Template '${template}' not found. Available templates: ${availableTemplates.join(', ')}`);
    }

    // Get other options
    const directory = this.getOption<string>(args, 'directory') || projectName;
    const description = this.getOption<string>(args, 'description') || `A new MPLP project created with ${template} template`;
    const author = this.getOption<string>(args, 'author') || await this.getDefaultAuthor();
    const license = this.getOption<string>(args, 'license', 'MIT');
    const git = !this.hasOption(args, 'no-git');
    const install = !this.hasOption(args, 'no-install');
    const typescript = this.hasOption(args, 'typescript');
    const eslint = this.hasOption(args, 'eslint');
    const prettier = this.hasOption(args, 'prettier');

    return {
      name: projectName,
      template,
      directory,
      description,
      author,
      license,
      git,
      install,
      typescript,
      eslint,
      prettier
    };
  }

  /**
   * Validate project options
   */
  private validateProjectOptions(options: ProjectOptions): void {
    // Validate project name
    if (!options.name || options.name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }

    // Validate project name format
    if (!/^[a-zA-Z0-9-_]+$/.test(options.name)) {
      throw new Error('Project name can only contain letters, numbers, hyphens, and underscores');
    }

    // Check if directory already exists
    const targetPath = path.resolve(options.directory || options.name);
    if (fs.existsSync(targetPath)) {
      const files = fs.readdirSync(targetPath);
      if (files.length > 0) {
        throw new Error(`Directory '${targetPath}' already exists and is not empty`);
      }
    }
  }

  /**
   * Create the project
   */
  private async createProject(options: ProjectOptions): Promise<void> {
    const targetPath = path.resolve(options.directory || options.name);
    
    this.logger.header(`Creating MPLP project: ${options.name}`);
    this.logger.info(`Template: ${options.template}`);
    this.logger.info(`Directory: ${targetPath}`);
    this.logger.newline();

    // Create project from template
    await this.executeWithSpinner(
      () => this.templateManager.createProject(options, targetPath),
      'Creating project structure...',
      'Project structure created'
    );

    // Initialize Git repository
    if (options.git) {
      await this.executeWithSpinner(
        () => this.initializeGit(targetPath),
        'Initializing Git repository...',
        'Git repository initialized'
      );
    }

    // Install dependencies
    if (options.install) {
      await this.executeWithSpinner(
        () => this.installDependencies(targetPath),
        'Installing dependencies...',
        'Dependencies installed'
      );
    }
  }

  /**
   * Initialize Git repository
   */
  private async initializeGit(projectPath: string): Promise<void> {
    if (!this.gitOps.isRepository(projectPath)) {
      await this.gitOps.init(projectPath);
      
      // Create initial commit
      await this.gitOps.add(projectPath, ['.']);
      await this.gitOps.commit(projectPath, 'Initial commit');
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(projectPath: string): Promise<void> {
    const packageManager = await this.packageManager.detect(projectPath);
    await packageManager.install(projectPath);
  }

  /**
   * Get default author from Git config
   */
  private async getDefaultAuthor(): Promise<string> {
    try {
      const name = await this.gitOps.getConfig('user.name');
      const email = await this.gitOps.getConfig('user.email');
      
      if (name && email) {
        return `${name} <${email}>`;
      } else if (name) {
        return name;
      }
    } catch {
      // Ignore errors
    }
    
    return 'Unknown Author';
  }

  /**
   * Show success message
   */
  private showSuccessMessage(options: ProjectOptions): void {
    const projectPath = path.resolve(options.directory || options.name);
    
    this.logger.newline();
    this.success('Project created successfully!');
    this.logger.newline();
    
    this.logger.subheader('Next steps:');
    this.logger.commands([
      { command: `cd ${options.name}`, description: 'Navigate to project directory' },
      { command: 'mplp --help', description: 'See available commands' },
      { command: 'npm run dev', description: 'Start development server (if available)' },
      { command: 'npm test', description: 'Run tests' }
    ]);
    
    this.logger.newline();
    this.logger.info('For more information, visit: https://mplp.dev/docs');
  }
}
