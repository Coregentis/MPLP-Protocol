"use strict";
/**
 * @fileoverview Base Platform Adapter implementation
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlatformAdapter = void 0;
const events_1 = require("events");
const errors_1 = require("../types/errors");
const utils_1 = require("../utils");
/**
 * Base implementation for platform adapters
 */
class BasePlatformAdapter extends events_1.EventEmitter {
    _status = 'disconnected';
    _config;
    _lastActivity;
    _errorCount = 0;
    _messageCount = 0;
    _initialized = false;
    _destroyed = false;
    constructor() {
        super();
        // Set up error handling
        this.on('error', () => {
            this._errorCount++;
            this._lastActivity = new Date();
            this._setStatus('error');
        });
    }
    /**
     * Get current adapter status
     */
    get status() {
        return this._status;
    }
    /**
     * Initialize the platform adapter
     */
    async initialize(config) {
        if (this._destroyed) {
            throw new errors_1.PlatformAdapterError('Cannot initialize destroyed adapter');
        }
        if (this._initialized) {
            throw new errors_1.PlatformAdapterError('Adapter is already initialized');
        }
        try {
            await this._validateConfig(config);
            this._config = { ...config };
            await this._doInitialize(config);
            this._initialized = true;
        }
        catch (error) {
            const adapterError = new errors_1.PlatformAdapterError(`Failed to initialize ${this.name} adapter: ${error instanceof Error ? error.message : String(error)}`, { platform: this.name, originalError: error });
            this.emit('error', adapterError);
            throw adapterError;
        }
    }
    /**
     * Connect to the platform
     */
    async connect() {
        if (this._destroyed) {
            throw new errors_1.PlatformAdapterError('Cannot connect destroyed adapter');
        }
        if (!this._initialized) {
            throw new errors_1.PlatformAdapterError('Adapter must be initialized before connecting');
        }
        if (this._status === 'connected') {
            return; // Already connected
        }
        if (this._status === 'connecting') {
            throw new errors_1.PlatformConnectionError('Adapter is already connecting');
        }
        try {
            this._setStatus('connecting');
            await (0, utils_1.retryWithBackoff)(async () => {
                await this._doConnect();
            }, this._config?.retries || 3, 1000, 10000);
            this._setStatus('connected');
            this._lastActivity = new Date();
            this.emit('connected');
        }
        catch (error) {
            this._setStatus('error');
            const connectionError = new errors_1.PlatformConnectionError(`Failed to connect to ${this.name}: ${error instanceof Error ? error.message : String(error)}`, { platform: this.name, originalError: error });
            this.emit('error', connectionError);
            throw connectionError;
        }
    }
    /**
     * Disconnect from the platform
     */
    async disconnect() {
        if (this._destroyed) {
            return; // Already destroyed
        }
        if (this._status === 'disconnected') {
            return; // Already disconnected
        }
        try {
            await this._doDisconnect();
            this._setStatus('disconnected');
            this.emit('disconnected');
        }
        catch (error) {
            const adapterError = new errors_1.PlatformAdapterError(`Failed to disconnect from ${this.name}: ${error instanceof Error ? error.message : String(error)}`, { platform: this.name, originalError: error });
            this.emit('error', adapterError);
            throw adapterError;
        }
    }
    /**
     * Send a message through the platform
     */
    async sendMessage(message) {
        if (this._destroyed) {
            throw new errors_1.PlatformAdapterError('Cannot send message from destroyed adapter');
        }
        if (this._status !== 'connected') {
            throw new errors_1.PlatformAdapterError(`Cannot send message when adapter status is '${this._status}'`);
        }
        try {
            await this._doSendMessage(message);
            this._messageCount++;
            this._lastActivity = new Date();
        }
        catch (error) {
            const adapterError = new errors_1.PlatformAdapterError(`Failed to send message via ${this.name}: ${error instanceof Error ? error.message : String(error)}`, { platform: this.name, message, originalError: error });
            this.emit('error', adapterError);
            throw adapterError;
        }
    }
    /**
     * Get current adapter status
     */
    getStatus() {
        return {
            status: this._status,
            connected: this._status === 'connected',
            lastActivity: this._lastActivity,
            errorCount: this._errorCount,
            messageCount: this._messageCount
        };
    }
    /**
     * Cleanup resources
     */
    async destroy() {
        if (this._destroyed) {
            return; // Already destroyed
        }
        try {
            // Disconnect if connected
            if (this._status === 'connected' || this._status === 'connecting') {
                await this.disconnect();
            }
            // Cleanup implementation-specific resources
            await this._doDestroy();
            this._destroyed = true;
            this._initialized = false;
            // Remove all listeners
            this.removeAllListeners();
        }
        catch (error) {
            const adapterError = new errors_1.PlatformAdapterError(`Failed to destroy ${this.name} adapter: ${error instanceof Error ? error.message : String(error)}`, { platform: this.name, originalError: error });
            this.emit('error', adapterError);
            throw adapterError;
        }
    }
    /**
     * Check if adapter is destroyed
     */
    isDestroyed() {
        return this._destroyed;
    }
    /**
     * Check if adapter is initialized
     */
    isInitialized() {
        return this._initialized;
    }
    /**
     * Get adapter configuration (read-only)
     */
    getConfig() {
        return this._config ? { ...this._config } : undefined;
    }
    /**
     * Set adapter status and emit event
     */
    _setStatus(newStatus) {
        const previousStatus = this._status;
        this._status = newStatus;
        if (previousStatus !== newStatus) {
            this.emit('status-changed', newStatus);
        }
    }
    /**
     * Handle incoming messages
     */
    _handleMessage(message) {
        this._lastActivity = new Date();
        this.emit('message', message);
    }
}
exports.BasePlatformAdapter = BasePlatformAdapter;
//# sourceMappingURL=BasePlatformAdapter.js.map