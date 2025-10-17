"use strict";
/**
 * @fileoverview MPLPAgent implementation with lifecycle management - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLPAgent = void 0;
const MPLPEventManager_1 = require("../core/MPLPEventManager");
const types_1 = require("../types");
const errors_1 = require("../types/errors");
const utils_1 = require("../utils");
const PlatformAdapterRegistry_1 = require("../adapters/PlatformAdapterRegistry");
/**
 * MPLP Agent implementation with complete lifecycle management - 基于MPLP V1.0 Alpha事件架构
 */
class MPLPAgent {
    constructor(config, registry) {
        this._status = types_1.AgentStatus.IDLE;
        this._errorCount = 0;
        this._messageCount = 0;
        this._destroyed = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.id = config.id;
        this.name = config.name;
        this.capabilities = [...config.capabilities];
        this._config = (0, utils_1.deepClone)(config);
        this._registry = registry || PlatformAdapterRegistry_1.PlatformAdapterRegistry.getInstance();
        // Set up error handling
        this.on('error', (error) => {
            this._errorCount++;
            this._lastActivity = new Date();
            // Call behavior error handler if defined
            if (this._config.behavior?.onError) {
                try {
                    void this._config.behavior.onError(error);
                }
                catch (behaviorError) {
                    console.error('Error in behavior error handler:', behaviorError);
                }
            }
        });
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Get current agent status
     */
    get status() {
        return this._status;
    }
    /**
     * Start the agent
     */
    async start() {
        if (this._destroyed) {
            throw new errors_1.AgentStateError('Cannot start destroyed agent');
        }
        if (this._status === types_1.AgentStatus.RUNNING) {
            return; // Already running
        }
        if (this._status === types_1.AgentStatus.STARTING) {
            throw new errors_1.AgentStateError('Agent is already starting');
        }
        try {
            this._setStatus(types_1.AgentStatus.STARTING);
            // Initialize platform adapter if configured
            if (this._config.platform && this._config.platformConfig) {
                await this._initializePlatformAdapter();
            }
            // Call behavior start handler if defined
            if (this._config.behavior?.onStart) {
                await this._config.behavior.onStart();
            }
            this._startTime = new Date();
            this._lastActivity = new Date();
            this._setStatus(types_1.AgentStatus.RUNNING);
            this.emit('started');
        }
        catch (error) {
            this._setStatus(types_1.AgentStatus.ERROR);
            const lifecycleError = new errors_1.AgentLifecycleError(`Failed to start agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`, { agentId: this.id, originalError: error });
            this.emit('error', lifecycleError);
            throw lifecycleError;
        }
    }
    /**
     * Stop the agent
     */
    async stop() {
        if (this._destroyed) {
            throw new errors_1.AgentStateError('Cannot stop destroyed agent');
        }
        if (this._status === types_1.AgentStatus.STOPPED || this._status === types_1.AgentStatus.IDLE) {
            return; // Already stopped
        }
        if (this._status === types_1.AgentStatus.STOPPING) {
            throw new errors_1.AgentStateError('Agent is already stopping');
        }
        try {
            this._setStatus(types_1.AgentStatus.STOPPING);
            // Call behavior stop handler if defined
            if (this._config.behavior?.onStop) {
                await this._config.behavior.onStop();
            }
            // Disconnect platform adapter if connected
            if (this._platformAdapter) {
                await this._platformAdapter.disconnect();
            }
            this._setStatus(types_1.AgentStatus.STOPPED);
            this.emit('stopped');
        }
        catch (error) {
            this._setStatus(types_1.AgentStatus.ERROR);
            const lifecycleError = new errors_1.AgentLifecycleError(`Failed to stop agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`, { agentId: this.id, originalError: error });
            this.emit('error', lifecycleError);
            throw lifecycleError;
        }
    }
    /**
     * Get current agent status information
     */
    getStatus() {
        const uptime = this._startTime && this._status === types_1.AgentStatus.RUNNING
            ? Date.now() - this._startTime.getTime()
            : undefined;
        return {
            status: this._status,
            startTime: this._startTime,
            uptime,
            lastActivity: this._lastActivity,
            errorCount: this._errorCount,
            messageCount: this._messageCount,
            metadata: this._config.metadata ? { ...this._config.metadata } : undefined
        };
    }
    /**
     * Send a message through the agent
     */
    async sendMessage(message) {
        if (this._destroyed) {
            throw new errors_1.AgentStateError('Cannot send message from destroyed agent');
        }
        if (this._status !== types_1.AgentStatus.RUNNING) {
            throw new errors_1.AgentStateError(`Cannot send message when agent status is '${this._status}'`);
        }
        try {
            if (this._platformAdapter) {
                await this._platformAdapter.sendMessage(message);
            }
            this._messageCount++;
            this._lastActivity = new Date();
            this.emit('message-sent', message);
        }
        catch (error) {
            const sendError = new errors_1.MessageSendError(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`, { agentId: this.id, message, originalError: error });
            this.emit('error', sendError);
            throw sendError;
        }
    }
    /**
     * Update agent configuration
     */
    async updateConfig(config) {
        if (this._destroyed) {
            throw new errors_1.AgentStateError('Cannot update config of destroyed agent');
        }
        const newConfig = { ...this._config, ...config };
        // Validate the new configuration
        if (newConfig.name !== this._config.name) {
            throw new errors_1.AgentLifecycleError('Cannot change agent name after creation');
        }
        if (newConfig.id !== this._config.id) {
            throw new errors_1.AgentLifecycleError('Cannot change agent ID after creation');
        }
        // Update configuration
        this._config = newConfig;
        // If platform configuration changed and agent is running, reinitialize adapter
        if (this._status === types_1.AgentStatus.RUNNING &&
            (config.platform || config.platformConfig)) {
            await this._reinitializePlatformAdapter();
        }
    }
    /**
     * Cleanup and destroy the agent
     */
    async destroy() {
        if (this._destroyed) {
            return; // Already destroyed
        }
        try {
            // Stop the agent if running
            if (this._status === types_1.AgentStatus.RUNNING || this._status === types_1.AgentStatus.STARTING) {
                await this.stop();
            }
            // Cleanup platform adapter
            if (this._platformAdapter) {
                await this._platformAdapter.destroy();
                this._platformAdapter = undefined;
            }
            this._destroyed = true;
            this._setStatus(types_1.AgentStatus.DESTROYED);
            // Emit destroyed event before removing listeners
            this.emit('destroyed');
            // Remove all listeners
            this.removeAllListeners();
        }
        catch (error) {
            const lifecycleError = new errors_1.AgentLifecycleError(`Failed to destroy agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`, { agentId: this.id, originalError: error });
            this.emit('error', lifecycleError);
            throw lifecycleError;
        }
    }
    /**
     * Check if agent is destroyed
     */
    isDestroyed() {
        return this._destroyed;
    }
    /**
     * Get agent configuration (read-only)
     */
    getConfig() {
        return (0, utils_1.deepClone)(this._config);
    }
    /**
     * Get platform adapter (if any)
     */
    getPlatformAdapter() {
        return this._platformAdapter;
    }
    /**
     * Set agent status and emit event
     */
    _setStatus(newStatus) {
        const previousStatus = this._status;
        this._status = newStatus;
        this.emit('status-changed', newStatus, previousStatus);
    }
    /**
     * Initialize platform adapter
     */
    async _initializePlatformAdapter() {
        if (!this._config.platform || !this._config.platformConfig) {
            return;
        }
        const AdapterClass = this._registry.get(this._config.platform);
        if (!AdapterClass) {
            throw new errors_1.PlatformAdapterNotFoundError(this._config.platform);
        }
        this._platformAdapter = new AdapterClass();
        // Set up platform adapter event handlers
        this._platformAdapter.on('message', (message) => {
            this._lastActivity = new Date();
            this.emit('message-received', message);
            // Call behavior message handler if defined
            if (this._config.behavior?.onMessage) {
                void this._config.behavior.onMessage(message);
            }
        });
        this._platformAdapter.on('error', (error) => {
            this.emit('error', error);
        });
        // Initialize and connect
        await this._platformAdapter.initialize(this._config.platformConfig);
        await this._platformAdapter.connect();
    }
    /**
     * Reinitialize platform adapter with new configuration
     */
    async _reinitializePlatformAdapter() {
        // Cleanup existing adapter
        if (this._platformAdapter) {
            await this._platformAdapter.destroy();
            this._platformAdapter = undefined;
        }
        // Initialize new adapter
        await this._initializePlatformAdapter();
    }
}
exports.MPLPAgent = MPLPAgent;
//# sourceMappingURL=MPLPAgent.js.map