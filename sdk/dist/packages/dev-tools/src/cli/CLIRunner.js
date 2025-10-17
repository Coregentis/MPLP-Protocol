"use strict";
/**
 * @fileoverview CLI Runner - Command line interface for dev tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIRunner = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const DebugManager_1 = require("../debug/DebugManager");
const PerformanceAnalyzer_1 = require("../performance/PerformanceAnalyzer");
const MonitoringDashboard_1 = require("../monitoring/MonitoringDashboard");
const DevToolsServer_1 = require("../server/DevToolsServer");
/**
 * CLI runner for MPLP development tools
 */
class CLIRunner {
    constructor() {
        this.program = new commander_1.Command();
        this.debugManager = new DebugManager_1.DebugManager();
        this.performanceAnalyzer = new PerformanceAnalyzer_1.PerformanceAnalyzer();
        this.monitoringDashboard = new MonitoringDashboard_1.MonitoringDashboard();
        this.devToolsServer = new DevToolsServer_1.DevToolsServer();
        this.setupCommands();
    }
    /**
     * Setup CLI commands
     */
    setupCommands() {
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
    async handleDebugCommand(options) {
        if (options.start) {
            const spinner = (0, ora_1.default)('Starting debug manager...').start();
            try {
                await this.debugManager.start();
                spinner.succeed(chalk_1.default.green('Debug manager started successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to start debug manager: ${error.message}`));
            }
        }
        else if (options.stop) {
            const spinner = (0, ora_1.default)('Stopping debug manager...').start();
            try {
                await this.debugManager.stop();
                spinner.succeed(chalk_1.default.green('Debug manager stopped successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to stop debug manager: ${error.message}`));
            }
        }
        else if (options.status) {
            const stats = this.debugManager.getStatistics();
            console.log(chalk_1.default.blue('Debug Manager Status:'));
            console.log(`  Active: ${stats.isActive ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
            console.log(`  Active Sessions: ${stats.activeSessions}`);
            console.log(`  Total Breakpoints: ${stats.totalBreakpoints}`);
            console.log(`  Total Watch Expressions: ${stats.totalWatchExpressions}`);
        }
        else {
            this.program.help();
        }
    }
    /**
     * Handle performance command
     */
    async handlePerformanceCommand(options) {
        if (options.start) {
            const spinner = (0, ora_1.default)('Starting performance analyzer...').start();
            try {
                await this.performanceAnalyzer.start();
                spinner.succeed(chalk_1.default.green('Performance analyzer started successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to start performance analyzer: ${error.message}`));
            }
        }
        else if (options.stop) {
            const spinner = (0, ora_1.default)('Stopping performance analyzer...').start();
            try {
                await this.performanceAnalyzer.stop();
                spinner.succeed(chalk_1.default.green('Performance analyzer stopped successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to stop performance analyzer: ${error.message}`));
            }
        }
        else if (options.status || options.metrics) {
            const summary = this.performanceAnalyzer.getPerformanceSummary();
            console.log(chalk_1.default.blue('Performance Analyzer Status:'));
            console.log(`  Active: ${summary.isActive ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
            console.log(`  Uptime: ${Math.round(summary.uptime / 1000)}s`);
            console.log(`  Total Metrics: ${summary.totalMetrics}`);
            console.log(`  Metric Types: ${summary.metricTypes}`);
            if (options.metrics && Object.keys(summary.metrics).length > 0) {
                console.log(chalk_1.default.blue('\nMetrics:'));
                Object.entries(summary.metrics).forEach(([name, stats]) => {
                    if (stats) {
                        console.log(`  ${name}:`);
                        console.log(`    Count: ${stats.count}`);
                        console.log(`    Average: ${stats.average?.toFixed(2)}`);
                        console.log(`    Min: ${stats.min}`);
                        console.log(`    Max: ${stats.max}`);
                    }
                });
            }
        }
        else {
            this.program.help();
        }
    }
    /**
     * Handle monitoring command
     */
    async handleMonitoringCommand(options) {
        if (options.start) {
            const spinner = (0, ora_1.default)('Starting monitoring dashboard...').start();
            try {
                await this.monitoringDashboard.start();
                spinner.succeed(chalk_1.default.green('Monitoring dashboard started successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to start monitoring dashboard: ${error.message}`));
            }
        }
        else if (options.stop) {
            const spinner = (0, ora_1.default)('Stopping monitoring dashboard...').start();
            try {
                await this.monitoringDashboard.stop();
                spinner.succeed(chalk_1.default.green('Monitoring dashboard stopped successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to stop monitoring dashboard: ${error.message}`));
            }
        }
        else if (options.status) {
            const stats = this.monitoringDashboard.getStatistics();
            console.log(chalk_1.default.blue('Monitoring Dashboard Status:'));
            console.log(`  Active: ${stats.isActive ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
            console.log(`  Panel Count: ${stats.panelCount}`);
            console.log(`  Last Update: ${stats.lastUpdate}`);
            console.log(`  Refresh Interval: ${stats.refreshInterval}ms`);
        }
        else if (options.dashboard) {
            const dashboardData = this.monitoringDashboard.getDashboardData();
            console.log(chalk_1.default.blue('Dashboard Data:'));
            console.log(JSON.stringify(dashboardData, null, 2));
        }
        else {
            this.program.help();
        }
    }
    /**
     * Handle server command
     */
    async handleServerCommand(options) {
        if (options.start) {
            const spinner = (0, ora_1.default)(`Starting dev tools server on port ${options.port}...`).start();
            try {
                await this.devToolsServer.start();
                spinner.succeed(chalk_1.default.green(`Dev tools server started on http://localhost:${this.devToolsServer.getPort()}`));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to start dev tools server: ${error.message}`));
            }
        }
        else if (options.stop) {
            const spinner = (0, ora_1.default)('Stopping dev tools server...').start();
            try {
                await this.devToolsServer.stop();
                spinner.succeed(chalk_1.default.green('Dev tools server stopped successfully'));
            }
            catch (error) {
                spinner.fail(chalk_1.default.red(`Failed to stop dev tools server: ${error.message}`));
            }
        }
        else if (options.status) {
            console.log(chalk_1.default.blue('Dev Tools Server Status:'));
            console.log(`  Running: ${this.devToolsServer.isServerRunning() ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}`);
            console.log(`  Port: ${this.devToolsServer.getPort()}`);
            if (this.devToolsServer.isServerRunning()) {
                console.log(`  URL: ${chalk_1.default.cyan(`http://localhost:${this.devToolsServer.getPort()}`)}`);
            }
        }
        else {
            this.program.help();
        }
    }
    /**
     * Handle status command
     */
    async handleStatusCommand() {
        console.log(chalk_1.default.blue.bold('🛠️  MPLP Development Tools Status\n'));
        // Debug Manager
        const debugStats = this.debugManager.getStatistics();
        console.log(chalk_1.default.blue('Debug Manager:'));
        console.log(`  Status: ${debugStats.isActive ? chalk_1.default.green('Active') : chalk_1.default.red('Inactive')}`);
        console.log(`  Sessions: ${debugStats.activeSessions}`);
        // Performance Analyzer
        const perfSummary = this.performanceAnalyzer.getPerformanceSummary();
        console.log(chalk_1.default.blue('\nPerformance Analyzer:'));
        console.log(`  Status: ${perfSummary.isActive ? chalk_1.default.green('Active') : chalk_1.default.red('Inactive')}`);
        console.log(`  Metrics: ${perfSummary.totalMetrics}`);
        // Monitoring Dashboard
        const monitorStats = this.monitoringDashboard.getStatistics();
        console.log(chalk_1.default.blue('\nMonitoring Dashboard:'));
        console.log(`  Status: ${monitorStats.isActive ? chalk_1.default.green('Active') : chalk_1.default.red('Inactive')}`);
        console.log(`  Panels: ${monitorStats.panelCount}`);
        // Dev Tools Server
        console.log(chalk_1.default.blue('\nDev Tools Server:'));
        console.log(`  Status: ${this.devToolsServer.isServerRunning() ? chalk_1.default.green('Running') : chalk_1.default.red('Stopped')}`);
        console.log(`  Port: ${this.devToolsServer.getPort()}`);
    }
    /**
     * Handle start all command
     */
    async handleStartAllCommand(options) {
        console.log(chalk_1.default.blue.bold('🚀 Starting all MPLP development tools...\n'));
        const spinner = (0, ora_1.default)('Starting debug manager...').start();
        try {
            await this.debugManager.start();
            spinner.succeed('Debug manager started');
        }
        catch (error) {
            spinner.fail(`Debug manager failed: ${error.message}`);
        }
        spinner.start('Starting performance analyzer...');
        try {
            await this.performanceAnalyzer.start();
            spinner.succeed('Performance analyzer started');
        }
        catch (error) {
            spinner.fail(`Performance analyzer failed: ${error.message}`);
        }
        spinner.start('Starting monitoring dashboard...');
        try {
            await this.monitoringDashboard.start();
            spinner.succeed('Monitoring dashboard started');
        }
        catch (error) {
            spinner.fail(`Monitoring dashboard failed: ${error.message}`);
        }
        spinner.start(`Starting dev tools server on port ${options.port}...`);
        try {
            await this.devToolsServer.start();
            spinner.succeed(`Dev tools server started on http://localhost:${this.devToolsServer.getPort()}`);
        }
        catch (error) {
            spinner.fail(`Dev tools server failed: ${error.message}`);
        }
        console.log(chalk_1.default.green.bold('\n✅ All development tools started successfully!'));
        console.log(chalk_1.default.cyan(`🌐 Dashboard: http://localhost:${this.devToolsServer.getPort()}`));
    }
    /**
     * Handle stop all command
     */
    async handleStopAllCommand() {
        console.log(chalk_1.default.blue.bold('🛑 Stopping all MPLP development tools...\n'));
        const spinner = (0, ora_1.default)('Stopping dev tools server...').start();
        try {
            await this.devToolsServer.stop();
            spinner.succeed('Dev tools server stopped');
        }
        catch (error) {
            spinner.fail(`Dev tools server failed: ${error.message}`);
        }
        spinner.start('Stopping monitoring dashboard...');
        try {
            await this.monitoringDashboard.stop();
            spinner.succeed('Monitoring dashboard stopped');
        }
        catch (error) {
            spinner.fail(`Monitoring dashboard failed: ${error.message}`);
        }
        spinner.start('Stopping performance analyzer...');
        try {
            await this.performanceAnalyzer.stop();
            spinner.succeed('Performance analyzer stopped');
        }
        catch (error) {
            spinner.fail(`Performance analyzer failed: ${error.message}`);
        }
        spinner.start('Stopping debug manager...');
        try {
            await this.debugManager.stop();
            spinner.succeed('Debug manager stopped');
        }
        catch (error) {
            spinner.fail(`Debug manager failed: ${error.message}`);
        }
        console.log(chalk_1.default.green.bold('\n✅ All development tools stopped successfully!'));
    }
    /**
     * Run CLI
     */
    async run(argv) {
        await this.program.parseAsync(argv);
    }
}
exports.CLIRunner = CLIRunner;
//# sourceMappingURL=CLIRunner.js.map