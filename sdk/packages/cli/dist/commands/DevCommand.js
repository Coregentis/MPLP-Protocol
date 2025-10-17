"use strict";
/**
 * @fileoverview Development server command
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevCommand = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const BaseCommand_1 = require("./BaseCommand");
const types_1 = require("../core/types");
const DevServer_1 = require("../dev/DevServer");
/**
 * Development server command
 */
class DevCommand extends BaseCommand_1.BaseCommand {
    constructor(context) {
        super(context);
        this.name = 'dev';
        this.description = 'Start the development server';
        this.aliases = ['serve', 'start'];
        this.arguments = [];
        this.options = [
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
        this.examples = [
            'mplp dev',
            'mplp dev --port 8080',
            'mplp dev --host 0.0.0.0 --port 3000',
            'mplp dev --no-open --no-hot-reload',
            'mplp dev --config ./dev.config.js',
            'mplp dev --env production --verbose'
        ];
    }
    /**
     * Execute the dev command
     */
    async execute(args) {
        try {
            // Validate we're in a project directory
            await this.validateProjectDirectory();
            // Get development server configuration
            const config = await this.getDevServerConfig(args);
            // Validate configuration
            this.validateDevServerConfig(config);
            // Start development server
            await this.startDevServer(config);
        }
        catch (error) {
            throw new types_1.ProjectCreationError(error.message, error);
        }
    }
    /**
     * Validate we're in a project directory
     */
    async validateProjectDirectory() {
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
    async getDevServerConfig(args) {
        const port = parseInt(this.getOption(args, 'port', '3000'), 10);
        const host = this.getOption(args, 'host', 'localhost');
        const openBrowser = !this.hasOption(args, 'no-open');
        const hotReload = !this.hasOption(args, 'no-hot-reload');
        const enableLogs = !this.hasOption(args, 'no-logs');
        const enableDebug = !this.hasOption(args, 'no-debug');
        const enableMetrics = !this.hasOption(args, 'no-metrics');
        const configPath = this.getOption(args, 'config');
        const environment = this.getOption(args, 'env', 'development');
        const verbose = this.hasOption(args, 'verbose');
        const quiet = this.hasOption(args, 'quiet');
        let config = {
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
    async loadCustomConfig(configPath) {
        const fullPath = path.resolve(configPath);
        if (!await fs.pathExists(fullPath)) {
            throw new Error(`Configuration file not found: ${configPath}`);
        }
        try {
            // Support both .js and .json config files
            if (fullPath.endsWith('.json')) {
                return await fs.readJson(fullPath);
            }
            else {
                // For .js files, use require
                delete require.cache[fullPath];
                const config = require(fullPath);
                return config.default || config;
            }
        }
        catch (error) {
            throw new Error(`Failed to load configuration file: ${error.message}`);
        }
    }
    /**
     * Load project-specific configuration
     */
    async loadProjectConfig() {
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
                }
                catch (error) {
                    this.warn(`Failed to load project configuration from ${configPath}: ${error.message}`);
                }
            }
        }
        return null;
    }
    /**
     * Validate development server configuration
     */
    validateDevServerConfig(config) {
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
    async startDevServer(config) {
        this.logger.header('Starting MPLP Development Server');
        this.logger.info(`Environment: ${config.environment}`);
        this.logger.info(`Server: http://${config.host}:${config.port}`);
        this.logger.info(`Project: ${path.basename(config.projectRoot)}`);
        this.logger.newline();
        // Show configuration summary
        this.showConfigurationSummary(config);
        // Create and start development server
        this.devServer = new DevServer_1.DevServer(config, this.context);
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
        }
        catch (error) {
            this.error(`Failed to start development server: ${error.message}`);
            throw error;
        }
    }
    /**
     * Show configuration summary
     */
    showConfigurationSummary(config) {
        this.logger.subheader('Configuration');
        const features = [];
        if (config.hotReload)
            features.push('Hot Reload');
        if (config.enableLogs)
            features.push('Live Logs');
        if (config.enableDebug)
            features.push('Debug Tools');
        if (config.enableMetrics)
            features.push('Performance Monitoring');
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
    showServerInfo(config) {
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
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
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
    async keepAlive() {
        return new Promise((resolve) => {
            // This promise never resolves, keeping the process alive
            // The process will exit through signal handlers
        });
    }
}
exports.DevCommand = DevCommand;
//# sourceMappingURL=DevCommand.js.map