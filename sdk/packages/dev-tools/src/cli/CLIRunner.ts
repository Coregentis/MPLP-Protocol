/**
 * @fileoverview CLI Runner - Command line interface for dev tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DebugManager } from '../debug/DebugManager';
import { PerformanceAnalyzer } from '../performance/PerformanceAnalyzer';
import { MonitoringDashboard } from '../monitoring/MonitoringDashboard';
import { DevToolsServer } from '../server/DevToolsServer';

/**
 * CLI runner for MPLP development tools
 */
export class CLIRunner {
  private program: Command;
  private debugManager: DebugManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  private monitoringDashboard: MonitoringDashboard;
  private devToolsServer: DevToolsServer;

  constructor() {
    this.program = new Command();
    this.debugManager = new DebugManager();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.monitoringDashboard = new MonitoringDashboard();
    this.devToolsServer = new DevToolsServer();

    this.setupCommands();
  }

  /**
   * Setup CLI commands
   */
  private setupCommands(): void {
    this.program
      .name('mplp-dev-tools')
      .description('MPLP Development Tools CLI')
      .version('1.1.0-beta');

    // Debug commands
    this.program
      .command('debug')
      .description('Debug management commands')
      .option('-s, --start', 'Start debugging')
      .option('-t, --stop', 'Stop debugging')
      .option('--status', 'Show debug status')
      .action(async (options) => {
        await this.handleDebugCommand(options);
      });

    // Performance commands
    this.program
      .command('perf')
      .alias('performance')
      .description('Performance analysis commands')
      .option('-s, --start', 'Start performance analysis')
      .option('-t, --stop', 'Stop performance analysis')
      .option('--status', 'Show performance status')
      .option('--metrics', 'Show performance metrics')
      .action(async (options) => {
        await this.handlePerformanceCommand(options);
      });

    // Monitoring commands
    this.program
      .command('monitor')
      .description('Monitoring commands')
      .option('-s, --start', 'Start monitoring')
      .option('-t, --stop', 'Stop monitoring')
      .option('--status', 'Show monitoring status')
      .option('--dashboard', 'Show dashboard data')
      .action(async (options) => {
        await this.handleMonitoringCommand(options);
      });

    // Server commands
    this.program
      .command('server')
      .description('Development server commands')
      .option('-s, --start', 'Start dev tools server')
      .option('-t, --stop', 'Stop dev tools server')
      .option('-p, --port <port>', 'Server port', '3002')
      .option('--status', 'Show server status')
      .action(async (options) => {
        await this.handleServerCommand(options);
      });

    // Status command
    this.program
      .command('status')
      .description('Show overall status of all tools')
      .action(async () => {
        await this.handleStatusCommand();
      });

    // Start all command
    this.program
      .command('start-all')
      .description('Start all development tools')
      .option('-p, --port <port>', 'Server port', '3002')
      .action(async (options) => {
        await this.handleStartAllCommand(options);
      });

    // Stop all command
    this.program
      .command('stop-all')
      .description('Stop all development tools')
      .action(async () => {
        await this.handleStopAllCommand();
      });
  }

  /**
   * Handle debug command
   */
  private async handleDebugCommand(options: any): Promise<void> {
    if (options.start) {
      const spinner = ora('Starting debug manager...').start();
      try {
        await this.debugManager.start();
        spinner.succeed(chalk.green('Debug manager started successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to start debug manager: ${(error as Error).message}`));
      }
    } else if (options.stop) {
      const spinner = ora('Stopping debug manager...').start();
      try {
        await this.debugManager.stop();
        spinner.succeed(chalk.green('Debug manager stopped successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to stop debug manager: ${(error as Error).message}`));
      }
    } else if (options.status) {
      const stats = this.debugManager.getStatistics();
      console.log(chalk.blue('Debug Manager Status:'));
      console.log(`  Active: ${stats.isActive ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Active Sessions: ${stats.activeSessions}`);
      console.log(`  Total Breakpoints: ${stats.totalBreakpoints}`);
      console.log(`  Total Watch Expressions: ${stats.totalWatchExpressions}`);
    } else {
      this.program.help();
    }
  }

  /**
   * Handle performance command
   */
  private async handlePerformanceCommand(options: any): Promise<void> {
    if (options.start) {
      const spinner = ora('Starting performance analyzer...').start();
      try {
        await this.performanceAnalyzer.start();
        spinner.succeed(chalk.green('Performance analyzer started successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to start performance analyzer: ${(error as Error).message}`));
      }
    } else if (options.stop) {
      const spinner = ora('Stopping performance analyzer...').start();
      try {
        await this.performanceAnalyzer.stop();
        spinner.succeed(chalk.green('Performance analyzer stopped successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to stop performance analyzer: ${(error as Error).message}`));
      }
    } else if (options.status || options.metrics) {
      const summary = this.performanceAnalyzer.getPerformanceSummary();
      console.log(chalk.blue('Performance Analyzer Status:'));
      console.log(`  Active: ${summary.isActive ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Uptime: ${Math.round(summary.uptime / 1000)}s`);
      console.log(`  Total Metrics: ${summary.totalMetrics}`);
      console.log(`  Metric Types: ${summary.metricTypes}`);
      
      if (options.metrics && Object.keys(summary.metrics).length > 0) {
        console.log(chalk.blue('\nMetrics:'));
        Object.entries(summary.metrics).forEach(([name, stats]) => {
          if (stats) {
            console.log(`  ${name}:`);
            console.log(`    Count: ${(stats as any).count}`);
            console.log(`    Average: ${(stats as any).average?.toFixed(2)}`);
            console.log(`    Min: ${(stats as any).min}`);
            console.log(`    Max: ${(stats as any).max}`);
          }
        });
      }
    } else {
      this.program.help();
    }
  }

  /**
   * Handle monitoring command
   */
  private async handleMonitoringCommand(options: any): Promise<void> {
    if (options.start) {
      const spinner = ora('Starting monitoring dashboard...').start();
      try {
        await this.monitoringDashboard.start();
        spinner.succeed(chalk.green('Monitoring dashboard started successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to start monitoring dashboard: ${(error as Error).message}`));
      }
    } else if (options.stop) {
      const spinner = ora('Stopping monitoring dashboard...').start();
      try {
        await this.monitoringDashboard.stop();
        spinner.succeed(chalk.green('Monitoring dashboard stopped successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to stop monitoring dashboard: ${(error as Error).message}`));
      }
    } else if (options.status) {
      const stats = this.monitoringDashboard.getStatistics();
      console.log(chalk.blue('Monitoring Dashboard Status:'));
      console.log(`  Active: ${stats.isActive ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Panel Count: ${stats.panelCount}`);
      console.log(`  Last Update: ${stats.lastUpdate}`);
      console.log(`  Refresh Interval: ${stats.refreshInterval}ms`);
    } else if (options.dashboard) {
      const dashboardData = this.monitoringDashboard.getDashboardData();
      console.log(chalk.blue('Dashboard Data:'));
      console.log(JSON.stringify(dashboardData, null, 2));
    } else {
      this.program.help();
    }
  }

  /**
   * Handle server command
   */
  private async handleServerCommand(options: any): Promise<void> {
    if (options.start) {
      const spinner = ora(`Starting dev tools server on port ${options.port}...`).start();
      try {
        await this.devToolsServer.start();
        spinner.succeed(chalk.green(`Dev tools server started on http://localhost:${this.devToolsServer.getPort()}`));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to start dev tools server: ${(error as Error).message}`));
      }
    } else if (options.stop) {
      const spinner = ora('Stopping dev tools server...').start();
      try {
        await this.devToolsServer.stop();
        spinner.succeed(chalk.green('Dev tools server stopped successfully'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed to stop dev tools server: ${(error as Error).message}`));
      }
    } else if (options.status) {
      console.log(chalk.blue('Dev Tools Server Status:'));
      console.log(`  Running: ${this.devToolsServer.isServerRunning() ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`  Port: ${this.devToolsServer.getPort()}`);
      if (this.devToolsServer.isServerRunning()) {
        console.log(`  URL: ${chalk.cyan(`http://localhost:${this.devToolsServer.getPort()}`)}`);
      }
    } else {
      this.program.help();
    }
  }

  /**
   * Handle status command
   */
  private async handleStatusCommand(): Promise<void> {
    console.log(chalk.blue.bold('🛠️  MPLP Development Tools Status\n'));

    // Debug Manager
    const debugStats = this.debugManager.getStatistics();
    console.log(chalk.blue('Debug Manager:'));
    console.log(`  Status: ${debugStats.isActive ? chalk.green('Active') : chalk.red('Inactive')}`);
    console.log(`  Sessions: ${debugStats.activeSessions}`);

    // Performance Analyzer
    const perfSummary = this.performanceAnalyzer.getPerformanceSummary();
    console.log(chalk.blue('\nPerformance Analyzer:'));
    console.log(`  Status: ${perfSummary.isActive ? chalk.green('Active') : chalk.red('Inactive')}`);
    console.log(`  Metrics: ${perfSummary.totalMetrics}`);

    // Monitoring Dashboard
    const monitorStats = this.monitoringDashboard.getStatistics();
    console.log(chalk.blue('\nMonitoring Dashboard:'));
    console.log(`  Status: ${monitorStats.isActive ? chalk.green('Active') : chalk.red('Inactive')}`);
    console.log(`  Panels: ${monitorStats.panelCount}`);

    // Dev Tools Server
    console.log(chalk.blue('\nDev Tools Server:'));
    console.log(`  Status: ${this.devToolsServer.isServerRunning() ? chalk.green('Running') : chalk.red('Stopped')}`);
    console.log(`  Port: ${this.devToolsServer.getPort()}`);
  }

  /**
   * Handle start all command
   */
  private async handleStartAllCommand(options: any): Promise<void> {
    console.log(chalk.blue.bold('🚀 Starting all MPLP development tools...\n'));

    const spinner = ora('Starting debug manager...').start();
    try {
      await this.debugManager.start();
      spinner.succeed('Debug manager started');
    } catch (error) {
      spinner.fail(`Debug manager failed: ${(error as Error).message}`);
    }

    spinner.start('Starting performance analyzer...');
    try {
      await this.performanceAnalyzer.start();
      spinner.succeed('Performance analyzer started');
    } catch (error) {
      spinner.fail(`Performance analyzer failed: ${(error as Error).message}`);
    }

    spinner.start('Starting monitoring dashboard...');
    try {
      await this.monitoringDashboard.start();
      spinner.succeed('Monitoring dashboard started');
    } catch (error) {
      spinner.fail(`Monitoring dashboard failed: ${(error as Error).message}`);
    }

    spinner.start(`Starting dev tools server on port ${options.port}...`);
    try {
      await this.devToolsServer.start();
      spinner.succeed(`Dev tools server started on http://localhost:${this.devToolsServer.getPort()}`);
    } catch (error) {
      spinner.fail(`Dev tools server failed: ${(error as Error).message}`);
    }

    console.log(chalk.green.bold('\n✅ All development tools started successfully!'));
    console.log(chalk.cyan(`🌐 Dashboard: http://localhost:${this.devToolsServer.getPort()}`));
  }

  /**
   * Handle stop all command
   */
  private async handleStopAllCommand(): Promise<void> {
    console.log(chalk.blue.bold('🛑 Stopping all MPLP development tools...\n'));

    const spinner = ora('Stopping dev tools server...').start();
    try {
      await this.devToolsServer.stop();
      spinner.succeed('Dev tools server stopped');
    } catch (error) {
      spinner.fail(`Dev tools server failed: ${(error as Error).message}`);
    }

    spinner.start('Stopping monitoring dashboard...');
    try {
      await this.monitoringDashboard.stop();
      spinner.succeed('Monitoring dashboard stopped');
    } catch (error) {
      spinner.fail(`Monitoring dashboard failed: ${(error as Error).message}`);
    }

    spinner.start('Stopping performance analyzer...');
    try {
      await this.performanceAnalyzer.stop();
      spinner.succeed('Performance analyzer stopped');
    } catch (error) {
      spinner.fail(`Performance analyzer failed: ${(error as Error).message}`);
    }

    spinner.start('Stopping debug manager...');
    try {
      await this.debugManager.stop();
      spinner.succeed('Debug manager stopped');
    } catch (error) {
      spinner.fail(`Debug manager failed: ${(error as Error).message}`);
    }

    console.log(chalk.green.bold('\n✅ All development tools stopped successfully!'));
  }

  /**
   * Run CLI
   */
  async run(argv?: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }
}
