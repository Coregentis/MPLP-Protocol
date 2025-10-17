"use strict";
/**
 * @fileoverview Mock Platform Adapter for testing and examples
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPlatformAdapter = void 0;
const errors_1 = require("../types/errors");
const BasePlatformAdapter_1 = require("./BasePlatformAdapter");
const utils_1 = require("../utils");
/**
 * Mock platform adapter for testing and demonstration purposes
 */
class MockPlatformAdapter extends BasePlatformAdapter_1.BasePlatformAdapter {
    constructor() {
        super(...arguments);
        this.name = 'mock';
        this.version = '1.0.0';
        this._simulateLatency = false;
        this._simulateErrors = false;
        this._connectionDelay = 100;
        this._messageDelay = 50;
        this._errorRate = 0; // 0-1, probability of error
        this._messageHistory = [];
    }
    /**
     * Validate adapter configuration
     */
    async _validateConfig(config) {
        // Mock adapter accepts any configuration
        if (config.simulateLatency !== undefined && typeof config.simulateLatency !== 'boolean') {
            throw new errors_1.PlatformAdapterError('simulateLatency must be a boolean');
        }
        if (config.simulateErrors !== undefined && typeof config.simulateErrors !== 'boolean') {
            throw new errors_1.PlatformAdapterError('simulateErrors must be a boolean');
        }
        if (config.connectionDelay !== undefined) {
            if (typeof config.connectionDelay !== 'number' || config.connectionDelay < 0) {
                throw new errors_1.PlatformAdapterError('connectionDelay must be a non-negative number');
            }
        }
        if (config.messageDelay !== undefined) {
            if (typeof config.messageDelay !== 'number' || config.messageDelay < 0) {
                throw new errors_1.PlatformAdapterError('messageDelay must be a non-negative number');
            }
        }
        if (config.errorRate !== undefined) {
            if (typeof config.errorRate !== 'number' || config.errorRate < 0 || config.errorRate > 1) {
                throw new errors_1.PlatformAdapterError('errorRate must be a number between 0 and 1');
            }
        }
    }
    /**
     * Initialize adapter with configuration
     */
    async _doInitialize(config) {
        this._simulateLatency = config.simulateLatency || false;
        this._simulateErrors = config.simulateErrors || false;
        this._connectionDelay = config.connectionDelay || 100;
        this._messageDelay = config.messageDelay || 50;
        this._errorRate = config.errorRate || 0;
        this._messageHistory = [];
        if (this._simulateLatency) {
            await (0, utils_1.delay)(50); // Simulate initialization delay
        }
    }
    /**
     * Connect to the platform
     */
    async _doConnect() {
        if (this._simulateErrors && Math.random() < this._errorRate) {
            throw new Error('Simulated connection error');
        }
        if (this._simulateLatency) {
            await (0, utils_1.delay)(this._connectionDelay);
        }
        // Simulate receiving some initial messages
        setTimeout(() => {
            if (this._status === 'connected') {
                this._handleMessage({ type: 'welcome', message: 'Connected to mock platform' });
            }
        }, 100);
    }
    /**
     * Disconnect from the platform
     */
    async _doDisconnect() {
        if (this._simulateLatency) {
            await (0, utils_1.delay)(50);
        }
    }
    /**
     * Send a message through the platform
     */
    async _doSendMessage(message) {
        if (this._simulateErrors && Math.random() < this._errorRate) {
            throw new Error('Simulated message send error');
        }
        if (this._simulateLatency) {
            await (0, utils_1.delay)(this._messageDelay);
        }
        // Store message in history
        this._messageHistory.push({
            timestamp: new Date(),
            message: message
        });
        // Simulate receiving an echo or response
        setTimeout(() => {
            if (this._status === 'connected') {
                this._handleMessage({
                    type: 'echo',
                    originalMessage: message,
                    timestamp: new Date()
                });
            }
        }, this._messageDelay);
    }
    /**
     * Cleanup implementation-specific resources
     */
    async _doDestroy() {
        this._messageHistory = [];
        if (this._simulateLatency) {
            await (0, utils_1.delay)(25);
        }
    }
    /**
     * Get message history (for testing)
     */
    getMessageHistory() {
        return [...this._messageHistory];
    }
    /**
     * Clear message history (for testing)
     */
    clearMessageHistory() {
        this._messageHistory = [];
    }
    /**
     * Simulate receiving a message (for testing)
     */
    simulateIncomingMessage(message) {
        if (this._status === 'connected') {
            this._handleMessage(message);
        }
    }
    /**
     * Get adapter statistics (for testing)
     */
    getStats() {
        return {
            messagesSent: this._messageHistory.length,
            messagesReceived: this._messageCount,
            errorCount: this._errorCount,
            uptime: this._lastActivity ? Date.now() - this._lastActivity.getTime() : undefined
        };
    }
    /**
     * Configure error simulation (for testing)
     */
    setErrorRate(rate) {
        if (rate < 0 || rate > 1) {
            throw new Error('Error rate must be between 0 and 1');
        }
        this._errorRate = rate;
    }
    /**
     * Configure latency simulation (for testing)
     */
    setLatencyConfig(connectionDelay, messageDelay) {
        if (connectionDelay < 0 || messageDelay < 0) {
            throw new Error('Delays must be non-negative');
        }
        this._connectionDelay = connectionDelay;
        this._messageDelay = messageDelay;
    }
    /**
     * Enable/disable error simulation (for testing)
     */
    setErrorSimulation(enabled) {
        this._simulateErrors = enabled;
    }
    /**
     * Enable/disable latency simulation (for testing)
     */
    setLatencySimulation(enabled) {
        this._simulateLatency = enabled;
    }
}
exports.MockPlatformAdapter = MockPlatformAdapter;
//# sourceMappingURL=MockPlatformAdapter.js.map