"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModule = void 0;
const events_1 = require("events");
/**
 * Base Module Class
 *
 * Abstract base class that all MPLP modules must extend.
 * Provides common functionality and lifecycle management for modules.
 */
class BaseModule extends events_1.EventEmitter {
    constructor(name, version = '1.0.0') {
        super();
        this.status = 'created';
        this.initialized = false;
        this.started = false;
        this.name = name;
        this.version = version;
    }
    /**
     * Gets the module name
     */
    getName() {
        return this.name;
    }
    /**
     * Gets the module version
     */
    getVersion() {
        return this.version;
    }
    /**
     * Gets the current module status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Checks if the module is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Checks if the module is started
     */
    isStarted() {
        return this.started;
    }
    /**
     * Initializes the module
     * Subclasses should override this method to provide custom initialization logic
     */
    async initialize() {
        if (this.initialized) {
            throw new Error(`Module '${this.name}' is already initialized`);
        }
        this.status = 'initializing';
        this.emit('initializing');
        try {
            await this.onInitialize();
            this.initialized = true;
            this.status = 'initialized';
            this.emit('initialized');
        }
        catch (error) {
            this.status = 'error';
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Starts the module
     * Subclasses should override this method to provide custom start logic
     */
    async start() {
        if (!this.initialized) {
            throw new Error(`Module '${this.name}' must be initialized before starting`);
        }
        if (this.started) {
            throw new Error(`Module '${this.name}' is already started`);
        }
        this.status = 'starting';
        this.emit('starting');
        try {
            await this.onStart();
            this.started = true;
            this.status = 'running';
            this.emit('started');
        }
        catch (error) {
            this.status = 'error';
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Stops the module
     * Subclasses should override this method to provide custom stop logic
     */
    async stop() {
        if (!this.started) {
            return; // Already stopped or never started
        }
        this.status = 'stopping';
        this.emit('stopping');
        try {
            await this.onStop();
            this.started = false;
            this.status = 'stopped';
            this.emit('stopped');
        }
        catch (error) {
            this.status = 'error';
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Restarts the module
     */
    async restart() {
        await this.stop();
        await this.start();
    }
    /**
     * Checks if the module is healthy
     * Subclasses should override this method to provide custom health checks
     */
    async isHealthy() {
        try {
            return await this.onHealthCheck();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Gets module configuration
     * Subclasses can override this method to provide configuration information
     */
    getConfig() {
        return {
            name: this.name,
            version: this.version,
            status: this.status,
            initialized: this.initialized,
            started: this.started,
        };
    }
    /**
     * Gets module statistics
     * Subclasses can override this method to provide custom statistics
     */
    getStats() {
        return {
            name: this.name,
            version: this.version,
            status: this.status,
            uptime: this.started ? Date.now() : 0,
        };
    }
    /**
     * Custom health check logic
     * Subclasses can override this method (default returns true)
     */
    async onHealthCheck() {
        return this.status === 'running';
    }
}
exports.BaseModule = BaseModule;
//# sourceMappingURL=BaseModule.js.map