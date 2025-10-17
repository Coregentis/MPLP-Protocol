"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLPApplication = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const ApplicationStatus_1 = require("./ApplicationStatus");
const ModuleManager_1 = require("../modules/ModuleManager");
const HealthChecker_1 = require("../health/HealthChecker");
const EventBus_1 = require("../events/EventBus");
const ConfigManager_1 = require("../config/ConfigManager");
const Logger_1 = require("../logging/Logger");
const ApplicationError_1 = require("../errors/ApplicationError");
/**
 * MPLPApplication - Core application class for MPLP SDK
 *
 * This class provides the main entry point for creating and managing
 * multi-agent applications using the MPLP protocol.
 *
 * Features:
 * - Application lifecycle management
 * - Module registration and management
 * - Health monitoring
 * - Event-driven architecture
 * - Configuration management
 * - Logging and error handling
 *
 * @example
 * ```typescript
 * const app = new MPLPApplication({
 *   name: 'MyBot',
 *   version: '1.0.0'
 * });
 *
 * await app.initialize();
 * await app.registerModule('context', new ContextModule());
 * await app.start();
 * ```
 */
class MPLPApplication extends events_1.EventEmitter {
    /**
     * Creates a new MPLP application instance
     *
     * @param config - Application configuration
     */
    constructor(config) {
        super();
        this.status = ApplicationStatus_1.ApplicationStatus.CREATED;
        this.id = (0, uuid_1.v4)();
        this.config = { ...config };
        // Initialize core components
        this.logger = new Logger_1.Logger(config.name || 'MPLPApplication');
        this.eventBus = new EventBus_1.EventBus();
        this.configManager = new ConfigManager_1.ConfigManager(config);
        this.moduleManager = new ModuleManager_1.ModuleManager(this.eventBus, this.logger);
        this.healthChecker = new HealthChecker_1.HealthChecker(this.moduleManager, this.logger);
        this.logger.info(`MPLP Application created: ${this.config.name} (${this.id})`);
    }
    /**
     * Gets the application ID
     */
    getId() {
        return this.id;
    }
    /**
     * Gets the application configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Gets the current application status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Gets application uptime in milliseconds
     */
    getUptime() {
        if (!this.startTime)
            return 0;
        const endTime = this.stopTime || new Date();
        return endTime.getTime() - this.startTime.getTime();
    }
    /**
     * Initializes the application
     *
     * This method prepares the application for use by:
     * - Validating configuration
     * - Setting up core services
     * - Preparing module registry
     *
     * @throws {ApplicationError} If initialization fails
     */
    async initialize() {
        if (this.status !== ApplicationStatus_1.ApplicationStatus.CREATED) {
            throw new ApplicationError_1.ApplicationError(`Cannot initialize application in status: ${this.status}`);
        }
        try {
            this.status = ApplicationStatus_1.ApplicationStatus.INITIALIZING;
            this.emit('initializing');
            this.logger.info('Initializing MPLP Application...');
            // Validate configuration
            this.validateConfig();
            // Initialize core components
            await this.configManager.initialize();
            await this.moduleManager.initialize();
            await this.healthChecker.initialize();
            this.status = ApplicationStatus_1.ApplicationStatus.INITIALIZED;
            this.emit('initialized');
            this.logger.info('MPLP Application initialized successfully');
        }
        catch (error) {
            this.status = ApplicationStatus_1.ApplicationStatus.ERROR;
            this.emit('error', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ApplicationError_1.ApplicationError(`Failed to initialize application: ${errorMessage}`, errorCause);
        }
    }
    /**
     * Registers a module with the application
     *
     * @param name - Module name
     * @param module - Module instance
     * @throws {ApplicationError} If registration fails
     */
    async registerModule(name, module) {
        if (this.status === ApplicationStatus_1.ApplicationStatus.RUNNING) {
            throw new ApplicationError_1.ApplicationError('Cannot register modules while application is running');
        }
        try {
            this.logger.info(`Registering module: ${name}`);
            await this.moduleManager.registerModule(name, module);
            this.emit('moduleRegistered', { name, module });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ApplicationError_1.ApplicationError(`Failed to register module ${name}: ${errorMessage}`, errorCause);
        }
    }
    /**
     * Gets a registered module by name
     *
     * @param name - Module name
     * @returns Module instance or undefined if not found
     */
    getModule(name) {
        return this.moduleManager.getModule(name);
    }
    /**
     * Gets all registered modules
     */
    getModules() {
        return this.moduleManager.getModules();
    }
    /**
     * Starts the application
     *
     * This method:
     * - Starts all registered modules
     * - Begins health monitoring
     * - Sets application status to running
     *
     * @throws {ApplicationError} If start fails
     */
    async start() {
        if (this.status !== ApplicationStatus_1.ApplicationStatus.INITIALIZED) {
            throw new ApplicationError_1.ApplicationError(`Cannot start application in status: ${this.status}`);
        }
        try {
            this.status = ApplicationStatus_1.ApplicationStatus.STARTING;
            this.emit('starting');
            this.logger.info('Starting MPLP Application...');
            // Start all modules
            await this.moduleManager.startAll();
            // Start health monitoring
            await this.healthChecker.start();
            this.startTime = new Date();
            this.status = ApplicationStatus_1.ApplicationStatus.RUNNING;
            this.emit('started');
            this.logger.info('MPLP Application started successfully');
        }
        catch (error) {
            this.status = ApplicationStatus_1.ApplicationStatus.ERROR;
            this.emit('error', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ApplicationError_1.ApplicationError(`Failed to start application: ${errorMessage}`, errorCause);
        }
    }
    /**
     * Stops the application gracefully
     *
     * @throws {ApplicationError} If stop fails
     */
    async stop() {
        if (this.status !== ApplicationStatus_1.ApplicationStatus.RUNNING) {
            throw new ApplicationError_1.ApplicationError(`Cannot stop application in status: ${this.status}`);
        }
        try {
            this.status = ApplicationStatus_1.ApplicationStatus.STOPPING;
            this.emit('stopping');
            this.logger.info('Stopping MPLP Application...');
            // Stop health monitoring
            await this.healthChecker.stop();
            // Stop all modules
            await this.moduleManager.stopAll();
            this.stopTime = new Date();
            this.status = ApplicationStatus_1.ApplicationStatus.STOPPED;
            this.emit('stopped');
            this.logger.info('MPLP Application stopped successfully');
        }
        catch (error) {
            this.status = ApplicationStatus_1.ApplicationStatus.ERROR;
            this.emit('error', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ApplicationError_1.ApplicationError(`Failed to stop application: ${errorMessage}`, errorCause);
        }
    }
    /**
     * Gets the current health status of the application
     */
    async getHealthStatus() {
        return await this.healthChecker.getHealthStatus();
    }
    /**
     * Gets application statistics
     */
    getStats() {
        return {
            id: this.id,
            name: this.config.name,
            version: this.config.version,
            status: this.status,
            uptime: this.getUptime(),
            startTime: this.startTime,
            stopTime: this.stopTime,
            moduleCount: this.moduleManager.getModules().size,
            modules: Array.from(this.moduleManager.getModules().keys()),
        };
    }
    /**
     * Validates the application configuration
     *
     * @private
     * @throws {ApplicationError} If configuration is invalid
     */
    validateConfig() {
        if (!this.config.name) {
            throw new ApplicationError_1.ApplicationError('Application name is required');
        }
        if (!this.config.version) {
            throw new ApplicationError_1.ApplicationError('Application version is required');
        }
        // Additional validation can be added here
    }
}
exports.MPLPApplication = MPLPApplication;
//# sourceMappingURL=MPLPApplication.js.map