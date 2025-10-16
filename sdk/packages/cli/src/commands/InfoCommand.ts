/**
 * @fileoverview Info command for displaying project and environment information
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
import { PackageManagerDetector } from '../utils/PackageManagerDetector';
import { GitOperations } from '../utils/GitOperations';

/**
 * Info command for displaying project and environment information
 */
export class InfoCommand extends BaseCommand {
  public readonly name = 'info';
  public readonly description = 'Display project and environment information';
  public readonly aliases = ['i'];

  public readonly options = [
    {
      flags: '--env',
      description: 'Show environment information only'
    },
    {
      flags: '--project',
      description: 'Show project information only'
    },
    {
      flags: '--json',
      description: 'Output information in JSON format'
    }
  ];

  public readonly examples = [
    'mplp info',
    'mplp info --env',
    'mplp info --project',
    'mplp info --json'
  ];

  private packageManager: PackageManagerDetector;
  private gitOps: GitOperations;

  constructor(context: any) {
    super(context);
    this.packageManager = new PackageManagerDetector();
    this.gitOps = new GitOperations();
  }

  /**
   * Execute the info command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    const showEnv = this.hasOption(args, 'env');
    const showProject = this.hasOption(args, 'project');
    const jsonOutput = this.hasOption(args, 'json');

    // Collect information
    const envInfo = await this.getEnvironmentInfo();
    const projectInfo = await this.getProjectInfo();

    if (jsonOutput) {
      const output: any = {};
      if (!showProject || showEnv) output.environment = envInfo;
      if (!showEnv || showProject) output.project = projectInfo;
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    // Display information
    if (!showProject || showEnv) {
      await this.displayEnvironmentInfo(envInfo);
    }

    if (!showEnv || showProject) {
      await this.displayProjectInfo(projectInfo);
    }
  }

  /**
   * Get environment information
   */
  private async getEnvironmentInfo(): Promise<any> {
    const nodeVersion = process.version;
    const platform = `${process.platform} ${process.arch}`;
    const cwd = process.cwd();
    const home = process.env.HOME || process.env.USERPROFILE || 'unknown';

    // Get package manager versions
    const npmVersion = await this.packageManager.getVersion('npm');
    const yarnVersion = await this.packageManager.getVersion('yarn');
    const pnpmVersion = await this.packageManager.getVersion('pnpm');

    // Get Git version
    const gitVersion = await this.gitOps.getVersion();

    return {
      node: nodeVersion,
      platform,
      cwd,
      home,
      packageManagers: {
        npm: npmVersion,
        yarn: yarnVersion,
        pnpm: pnpmVersion
      },
      git: gitVersion,
      mplpCli: this.context.config.version
    };
  }

  /**
   * Get project information
   */
  private async getProjectInfo(): Promise<any> {
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, 'package.json');

    // Check if we're in a project directory
    if (!await fs.pathExists(packageJsonPath)) {
      return {
        isProject: false,
        message: 'Not in a project directory (no package.json found)'
      };
    }

    const packageJson = await fs.readJson(packageJsonPath);
    
    // Detect package manager
    const detectedPM = await this.packageManager.detect(cwd);
    
    // Get Git information
    const gitInfo = await this.getGitInfo(cwd);
    
    // Check for MPLP dependencies
    const mplpDeps = this.getMPLPDependencies(packageJson);
    
    // Get project structure
    const structure = await this.getProjectStructure(cwd);

    return {
      isProject: true,
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license,
      packageManager: detectedPM.name,
      mplpDependencies: mplpDeps,
      git: gitInfo,
      structure,
      scripts: Object.keys(packageJson.scripts || {}),
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {})
    };
  }

  /**
   * Get Git information for the project
   */
  private async getGitInfo(cwd: string): Promise<any> {
    if (!this.gitOps.isRepository(cwd)) {
      return { isRepository: false };
    }

    try {
      const currentBranch = await this.gitOps.getCurrentBranch(cwd);
      const status = await this.gitOps.getStatus(cwd);
      const commits = await this.gitOps.getCommits(cwd, 5);
      const isClean = await this.gitOps.isWorkingDirectoryClean(cwd);

      return {
        isRepository: true,
        currentBranch,
        isClean,
        status,
        recentCommits: commits
      };
    } catch (error) {
      return {
        isRepository: true,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get MPLP dependencies
   */
  private getMPLPDependencies(packageJson: any): string[] {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    return Object.keys(allDeps).filter(dep => dep.startsWith('@mplp/'));
  }

  /**
   * Get project structure
   */
  private async getProjectStructure(cwd: string): Promise<any> {
    const structure: any = {};

    // Check for common directories
    const commonDirs = ['src', 'dist', 'build', 'test', 'tests', 'docs', 'examples'];
    for (const dir of commonDirs) {
      const dirPath = path.join(cwd, dir);
      if (await fs.pathExists(dirPath)) {
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          structure[dir] = await this.getDirectoryInfo(dirPath);
        }
      }
    }

    // Check for common files
    const commonFiles = [
      'tsconfig.json',
      'jest.config.js',
      '.eslintrc.js',
      '.prettierrc',
      'Dockerfile',
      'docker-compose.yml',
      '.env',
      '.env.example'
    ];

    structure.configFiles = [];
    for (const file of commonFiles) {
      const filePath = path.join(cwd, file);
      if (await fs.pathExists(filePath)) {
        structure.configFiles.push(file);
      }
    }

    return structure;
  }

  /**
   * Get directory information
   */
  private async getDirectoryInfo(dirPath: string): Promise<any> {
    try {
      const files = await fs.readdir(dirPath);
      const fileCount = files.length;
      
      // Count TypeScript and JavaScript files
      const tsFiles = files.filter(f => f.endsWith('.ts')).length;
      const jsFiles = files.filter(f => f.endsWith('.js')).length;
      const testFiles = files.filter(f => f.includes('.test.') || f.includes('.spec.')).length;

      return {
        fileCount,
        tsFiles,
        jsFiles,
        testFiles
      };
    } catch {
      return { error: 'Unable to read directory' };
    }
  }

  /**
   * Display environment information
   */
  private async displayEnvironmentInfo(envInfo: any): Promise<void> {
    this.logger.header('Environment Information');

    this.logger.table({
      'Node.js': envInfo.node,
      'Platform': envInfo.platform,
      'Current Directory': envInfo.cwd,
      'Home Directory': envInfo.home,
      'MPLP CLI': envInfo.mplpCli
    });

    this.logger.subheader('Package Managers');
    const pmTable: Record<string, string> = {};
    if (envInfo.packageManagers.npm) pmTable['npm'] = envInfo.packageManagers.npm;
    if (envInfo.packageManagers.yarn) pmTable['yarn'] = envInfo.packageManagers.yarn;
    if (envInfo.packageManagers.pnpm) pmTable['pnpm'] = envInfo.packageManagers.pnpm;
    
    this.logger.table(pmTable);

    if (envInfo.git) {
      this.logger.subheader('Git');
      this.logger.table({ 'Git': envInfo.git });
    }
  }

  /**
   * Display project information
   */
  private async displayProjectInfo(projectInfo: any): Promise<void> {
    if (!projectInfo.isProject) {
      this.logger.warn(projectInfo.message);
      return;
    }

    this.logger.header('Project Information');

    // Basic project info
    this.logger.table({
      'Name': projectInfo.name || 'Unknown',
      'Version': projectInfo.version || 'Unknown',
      'Description': projectInfo.description || 'No description',
      'Author': projectInfo.author || 'Unknown',
      'License': projectInfo.license || 'Unknown',
      'Package Manager': projectInfo.packageManager
    });

    // MPLP dependencies
    if (projectInfo.mplpDependencies.length > 0) {
      this.logger.subheader('MPLP Dependencies');
      this.logger.list(projectInfo.mplpDependencies);
    }

    // Git information
    if (projectInfo.git.isRepository) {
      this.logger.subheader('Git Repository');
      if (projectInfo.git.error) {
        this.logger.error(`Git error: ${projectInfo.git.error}`);
      } else {
        this.logger.table({
          'Current Branch': projectInfo.git.currentBranch,
          'Working Directory': projectInfo.git.isClean ? 'Clean' : 'Modified',
          'Staged Files': projectInfo.git.status.staged.length.toString(),
          'Unstaged Files': projectInfo.git.status.unstaged.length.toString(),
          'Untracked Files': projectInfo.git.status.untracked.length.toString()
        });
      }
    }

    // Project structure
    this.logger.subheader('Project Structure');
    for (const [dir, info] of Object.entries(projectInfo.structure)) {
      if (dir === 'configFiles') continue;
      
      const dirInfo = info as any;
      if (dirInfo.error) {
        this.logger.log(`  ${chalk.cyan(dir)}: ${chalk.red(dirInfo.error)}`);
      } else {
        this.logger.log(`  ${chalk.cyan(dir)}: ${dirInfo.fileCount} files (${dirInfo.tsFiles} TS, ${dirInfo.jsFiles} JS, ${dirInfo.testFiles} tests)`);
      }
    }

    if (projectInfo.structure.configFiles?.length > 0) {
      this.logger.log(`  ${chalk.cyan('Config files')}: ${projectInfo.structure.configFiles.join(', ')}`);
    }

    // Scripts
    if (projectInfo.scripts.length > 0) {
      this.logger.subheader('Available Scripts');
      this.logger.list(projectInfo.scripts.map((script: string) => `npm run ${script}`));
    }
  }
}
