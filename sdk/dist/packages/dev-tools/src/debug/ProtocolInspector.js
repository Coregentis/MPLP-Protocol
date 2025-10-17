"use strict";
/**
 * @fileoverview Protocol Inspector - Inspect MPLP protocol messages
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolInspector = void 0;
const events_1 = require("events");
/**
 * Protocol inspector for inspecting MPLP protocol messages
 */
class ProtocolInspector extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.inspectedMessages = [];
        this.isActive = false;
        this.maxMessages = 1000;
        this.config = config;
    }
    /**
     * Start protocol inspection
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.emit('started');
    }
    /**
     * Stop protocol inspection
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.inspectedMessages = [];
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Inspect protocol message
     */
    inspectMessage(data) {
        if (!this.isActive) {
            return;
        }
        const inspectionData = {
            ...data,
            timestamp: new Date()
        };
        this.inspectedMessages.push(inspectionData);
        // Keep only the most recent messages
        if (this.inspectedMessages.length > this.maxMessages) {
            this.inspectedMessages = this.inspectedMessages.slice(-this.maxMessages);
        }
        this.emit('messageInspected', inspectionData);
    }
    /**
     * Get all inspected messages
     */
    getAllMessages() {
        return [...this.inspectedMessages];
    }
    /**
     * Get messages by type
     */
    getMessagesByType(messageType) {
        return this.inspectedMessages.filter(msg => msg.messageType === messageType);
    }
    /**
     * Get messages by source
     */
    getMessagesBySource(source) {
        return this.inspectedMessages.filter(msg => msg.source === source);
    }
    /**
     * Get messages by destination
     */
    getMessagesByDestination(destination) {
        return this.inspectedMessages.filter(msg => msg.destination === destination);
    }
    /**
     * Get messages in time range
     */
    getMessagesInTimeRange(startTime, endTime) {
        return this.inspectedMessages.filter(msg => msg.timestamp >= startTime && msg.timestamp <= endTime);
    }
    /**
     * Clear all messages
     */
    clearMessages() {
        this.inspectedMessages = [];
        this.emit('messagesCleared');
    }
    /**
     * Get debugging statistics
     */
    getStatistics() {
        const messageTypes = new Map();
        const sources = new Map();
        const destinations = new Map();
        this.inspectedMessages.forEach(msg => {
            messageTypes.set(msg.messageType, (messageTypes.get(msg.messageType) || 0) + 1);
            sources.set(msg.source, (sources.get(msg.source) || 0) + 1);
            destinations.set(msg.destination, (destinations.get(msg.destination) || 0) + 1);
        });
        return {
            isActive: this.isActive,
            totalMessages: this.inspectedMessages.length,
            messageTypes: Object.fromEntries(messageTypes),
            sources: Object.fromEntries(sources),
            destinations: Object.fromEntries(destinations),
            timeRange: this.getTimeRange()
        };
    }
    /**
     * Get time range of messages
     */
    getTimeRange() {
        if (this.inspectedMessages.length === 0) {
            return {};
        }
        const timestamps = this.inspectedMessages.map(msg => msg.timestamp);
        return {
            start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
            end: new Date(Math.max(...timestamps.map(t => t.getTime())))
        };
    }
}
exports.ProtocolInspector = ProtocolInspector;
//# sourceMappingURL=ProtocolInspector.js.map