/**
 * @fileoverview Development server command
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';
import { DevServer } from '../dev/DevServer';
import { DevServerConfig } from '../dev/types';

/**
 * Development server command
 */
export class DevCommand extends BaseCommand {
  public readonly name = 'dev';
  public readonly description = 'Start the development server';
  public readonly aliases = ['serve', 'start'];
  
  public readonly arguments = [];

  public readonly options = [
    {
      flags: '-p, --port <port>',
      description: 'Port to run the development server on',
      defaultValue: '3000'
    },
    {
      flags: '-h, --host <host>',
      description: 'Host to bind the development server to',
      defaultValue: 'localhost'
    },
    {
      flags: '--no-open',
      description: 'Do not open browser automatically'
    },
    {
      flags: '--no-hot-reload',
      description: 'Disable hot reload functionality'
    },
    {
      flags: '--no-logs',
      description: 'Disable real-time log viewing'
    },
    {
      flags: '--no-debug',
      description: 'Disable debug tools integration'
    },
    {
      flags: '--no-metrics',
      description: 'Disable performance monitoring'
    },
    {
      flags: '--config <config>',
      description: 'Path to custom development server configuration'
    },
    {
      flags: '--env <env>',
      description: 'Environment to run in',
      defaultValue: 'development'
    },
    {
      flags: '--verbose',
      description: 'Enable verbose logging'
    },
    {
      flags: '--quiet',
      description: 'Suppress non-essential output'
    }
  ];

  public readonly examples = [
    'mplp dev',
    'mplp dev --port 8080',
    'mplp dev --host 0.0.0.0 --port 3000',
    'mplp dev --no-open --no-hot-reload',
    'mplp dev --config ./dev.config.js',
    'mplp dev --env production --verbose'
  ];

  private devServer?: DevServer;

  constructor(context: any) {
    super(context);
  }

  /**
   * Execute the dev command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get development server configuration
      const config = await this.getDevServerConfig(args);
      
      // Validate configuration
      this.validateDevServerConfig(config);
      
      // Start development server
      await this.startDevServer(config);
      
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
      this.warn('This doesn\'t appear to be an MPLP project. Development server may not work correctly.');
    }
  }

  /**
   * Get development server configuration
   */
  private async getDevServerConfig(args: CLICommandArgs): Promise<DevServerConfig> {
    const port = parseInt(this.getOption<string>(args, 'port', '3000'), 10);
    const host = this.getOption<string>(args, 'host', 'localhost');
    const openBrowser = !this.hasOption(args, 'no-open');
    const hotReload = !this.hasOption(args, 'no-hot-reload');
    const enableLogs = !this.hasOption(args, 'no-logs');
    const enableDebug = !this.hasOption(args, 'no-debug');
    const enableMetrics = !this.hasOption(args, 'no-metrics');
    const configPath = this.getOption<string>(args, 'config');
    const environment = this.getOption<string>(args, 'env', 'development');
    const verbose = this.hasOption(args, 'verbose');
    const quiet = this.hasOption(args, 'quiet');

    let config: DevServerConfig = {
      port,
      host,
      openBrowser,
      hotReload,
      enableLogs,
      enableDebug,
      enableMetrics,
      environment,
      verbose,
      quiet,
      projectRoot: process.cwd(),
      srcDir: path.join(process.cwd(), 'src'),
      distDir: path.join(process.cwd(), 'dist'),
      publicDir: path.join(process.cwd(), 'public'),
      watchPatterns: [
        'src/**/*.ts',
        'src/**/*.js',
        'src/**/*.json',
        'package.json',
        'tsconfig.json'
      ],
      ignorePatterns: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.test.js',
        'coverage/**'
      ]
    };

    // Load custom configuration if provided
    if (configPath) {
      const customConfig = await this.loadCustomConfig(configPath);
      config = { ...config, ...customConfig };
    }

    // Load project-specific configuration
    const projectConfig = await this.loadProjectConfig();
    if (projectConfig) {
      config = { ...config, ...projectConfig };
    }

    return config;
  }

  /**
   * Load custom configuration file
   */
  private async loadCustomConfig(configPath: string): Promise<Partial<DevServerConfig>> {
    const fullPath = path.resolve(configPath);
    
    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    try {
      // Support both .js and .json config files
      if (fullPath.endsWith('.json')) {
        return await fs.readJson(fullPath);
      } else {
        // For .js files, use require
        delete require.cache[fullPath];
        const config = require(fullPath);
        return config.default || config;
      }
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${(error as Error).message}`);
    }
  }

  /**
   * Load project-specific configuration
   */
  private async loadProjectConfig(): Promise<Partial<DevServerConfig> | null> {
    const configPaths = [
      'mplp.dev.config.js',
      'mplp.dev.config.json',
      '.mplprc.js',
      '.mplprc.json'
    ];

    for (const configPath of configPaths) {
      const fullPath = path.join(process.cwd(), configPath);
      
      if (await fs.pathExists(fullPath)) {
        try {
          return await this.loadCustomConfig(fullPath);
        } catch (error) {
          this.warn(`Failed to load project configuration from ${configPath}: ${(error as Error).message}`);
        }
      }
    }

    return null;
  }

  /**
   * Validate development server configuration
   */
  private validateDevServerConfig(config: DevServerConfig): void {
    // Validate port
    if (config.port < 1 || config.port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }

    // Validate host
    if (!config.host || config.host.trim().length === 0) {
      throw new Error('Host cannot be empty');
    }

    // Validate directories
    if (!fs.existsSync(config.projectRoot)) {
      throw new Error(`Project root directory does not exist: ${config.projectRoot}`);
    }

    // Warn about missing directories
    if (!fs.existsSync(config.srcDir)) {
      this.warn(`Source directory does not exist: ${config.srcDir}`);
    }

    if (!fs.existsSync(config.publicDir)) {
      this.warn(`Public directory does not exist: ${config.publicDir}`);
    }
  }

  /**
   * Start development server
   */
  private async startDevServer(config: DevServerConfig): Promise<void> {
    this.logger.header('Starting MPLP Development Server');
    this.logger.info(`Environment: ${config.environment}`);
    this.logger.info(`Server: http://${config.host}:${config.port}`);
    this.logger.info(`Project: ${path.basename(config.projectRoot)}`);
    this.logger.newline();

    // Show configuration summary
    this.showConfigurationSummary(config);

    // Create and start development server
    this.devServer = new DevServer(config, this.context);
    
    // Handle graceful shutdown
    this.setupGracefulShutdown();

    try {
      await this.devServer.start();
      
      this.logger.newline();
      this.success('Development server started successfully!');
      this.logger.newline();
      
      this.showServerInfo(config);
      
      // Keep the process running
      await this.keepAlive();
      
    } catch (error) {
      this.error(`Failed to start development server: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Show configuration summary
   */
  private showConfigurationSummary(config: DevServerConfig): void {
    this.logger.subheader('Configuration');
    
    const features = [];
    if (config.hotReload) features.push('Hot Reload');
    if (config.enableLogs) features.push('Live Logs');
    if (config.enableDebug) features.push('Debug Tools');
    if (config.enableMetrics) features.push('Performance Monitoring');
    
    this.logger.table({
      'Port': config.port.toString(),
      'Host': config.host,
      'Environment': config.environment,
      'Features': features.join(', ') || 'None',
      'Source Directory': path.relative(process.cwd(), config.srcDir),
      'Watch Patterns': config.watchPatterns.length.toString()
    });
    
    this.logger.newline();
  }

  /**
   * Show server information
   */
  private showServerInfo(config: DevServerConfig): void {
    this.logger.subheader('Server Information');
    
    const urls = [
      `Local:   http://${config.host}:${config.port}`,
      `Network: http://localhost:${config.port}`
    ];
    
    if (config.host !== 'localhost' && config.host !== '127.0.0.1') {
      urls.push(`External: http://${config.host}:${config.port}`);
    }
    
    urls.forEach(url => this.logger.info(url));
    this.logger.newline();
    
    this.logger.subheader('Available Commands');
    this.logger.commands([
      { command: 'Ctrl+C', description: 'Stop the development server' },
      { command: 'r + Enter', description: 'Restart the server' },
      { command: 'o + Enter', description: 'Open in browser' },
      { command: 'h + Enter', description: 'Show help' }
    ]);
    
    this.logger.newline();
    this.logger.info('Press Ctrl+C to stop the server');
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.newline();
      this.logger.info(`Received ${signal}, shutting down gracefully...`);
      
      if (this.devServer) {
        await this.devServer.stop();
      }
      
      this.logger.info('Development server stopped');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  /**
   * Keep the process alive
   */
  private async keepAlive(): Promise<void> {
    return new Promise((resolve) => {
      // This promise never resolves, keeping the process alive
      // The process will exit through signal handlers
    });
  }
}
