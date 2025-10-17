"use strict";
/**
 * @fileoverview State Inspector - Inspect component state changes
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateInspector = void 0;
const events_1 = require("events");
/**
 * State inspector for inspecting component state changes
 */
class StateInspector extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.stateHistory = [];
        this.currentStates = new Map();
        this.isActive = false;
        this.maxHistory = 1000;
        this.config = config;
    }
    /**
     * Start state inspection
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.emit('started');
    }
    /**
     * Stop state inspection
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.stateHistory = [];
        this.currentStates.clear();
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Inspect state change
     */
    inspectStateChange(componentId, componentType, newState) {
        if (!this.isActive) {
            return;
        }
        const previousState = this.currentStates.get(componentId);
        const changes = this.calculateStateChanges(previousState, newState);
        const inspectionData = {
            componentId,
            componentType,
            timestamp: new Date(),
            state: newState,
            previousState,
            changes
        };
        this.stateHistory.push(inspectionData);
        this.currentStates.set(componentId, newState);
        // Keep only the most recent history
        if (this.stateHistory.length > this.maxHistory) {
            this.stateHistory = this.stateHistory.slice(-this.maxHistory);
        }
        this.emit('stateChanged', inspectionData);
    }
    /**
     * Get current state of component
     */
    getCurrentState(componentId) {
        return this.currentStates.get(componentId);
    }
    /**
     * Get all current states
     */
    getAllCurrentStates() {
        return new Map(this.currentStates);
    }
    /**
     * Get state history for component
     */
    getStateHistory(componentId) {
        return this.stateHistory.filter(data => data.componentId === componentId);
    }
    /**
     * Get all state history
     */
    getAllStateHistory() {
        return [...this.stateHistory];
    }
    /**
     * Get state history by component type
     */
    getStateHistoryByType(componentType) {
        return this.stateHistory.filter(data => data.componentType === componentType);
    }
    /**
     * Get state history in time range
     */
    getStateHistoryInTimeRange(startTime, endTime) {
        return this.stateHistory.filter(data => data.timestamp >= startTime && data.timestamp <= endTime);
    }
    /**
     * Clear state history
     */
    clearHistory() {
        this.stateHistory = [];
        this.emit('historyCleared');
    }
    /**
     * Calculate state changes between old and new state
     */
    calculateStateChanges(oldState, newState) {
        const changes = [];
        if (!oldState) {
            // All properties are new
            this.addChangesForObject(newState, '', changes, 'added');
            return changes;
        }
        // Compare objects recursively
        this.compareObjects(oldState, newState, '', changes);
        return changes;
    }
    /**
     * Compare two objects recursively
     */
    compareObjects(oldObj, newObj, path, changes) {
        const oldKeys = new Set(Object.keys(oldObj || {}));
        const newKeys = new Set(Object.keys(newObj || {}));
        // Check for added properties
        for (const key of newKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            if (!oldKeys.has(key)) {
                changes.push({
                    path: currentPath,
                    oldValue: undefined,
                    newValue: newObj[key],
                    changeType: 'added'
                });
            }
            else if (oldObj[key] !== newObj[key]) {
                if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
                    this.compareObjects(oldObj[key], newObj[key], currentPath, changes);
                }
                else {
                    changes.push({
                        path: currentPath,
                        oldValue: oldObj[key],
                        newValue: newObj[key],
                        changeType: 'modified'
                    });
                }
            }
        }
        // Check for removed properties
        for (const key of oldKeys) {
            if (!newKeys.has(key)) {
                const currentPath = path ? `${path}.${key}` : key;
                changes.push({
                    path: currentPath,
                    oldValue: oldObj[key],
                    newValue: undefined,
                    changeType: 'removed'
                });
            }
        }
    }
    /**
     * Add changes for all properties in an object
     */
    addChangesForObject(obj, path, changes, changeType) {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            changes.push({
                path: currentPath,
                oldValue: changeType === 'added' ? undefined : value,
                newValue: changeType === 'removed' ? undefined : value,
                changeType
            });
            if (typeof value === 'object' && value !== null) {
                this.addChangesForObject(value, currentPath, changes, changeType);
            }
        }
    }
    /**
     * Get debugging statistics
     */
    getStatistics() {
        const componentTypes = new Map();
        const components = new Map();
        this.stateHistory.forEach(data => {
            componentTypes.set(data.componentType, (componentTypes.get(data.componentType) || 0) + 1);
            components.set(data.componentId, (components.get(data.componentId) || 0) + 1);
        });
        return {
            isActive: this.isActive,
            totalStateChanges: this.stateHistory.length,
            trackedComponents: this.currentStates.size,
            componentTypes: Object.fromEntries(componentTypes),
            mostActiveComponents: this.getMostActiveComponents(components),
            timeRange: this.getTimeRange()
        };
    }
    /**
     * Get most active components
     */
    getMostActiveComponents(components) {
        return Array.from(components.entries())
            .map(([componentId, changes]) => ({ componentId, changes }))
            .sort((a, b) => b.changes - a.changes)
            .slice(0, 10);
    }
    /**
     * Get time range of state changes
     */
    getTimeRange() {
        if (this.stateHistory.length === 0) {
            return {};
        }
        const timestamps = this.stateHistory.map(data => data.timestamp);
        return {
            start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
            end: new Date(Math.max(...timestamps.map(t => t.getTime())))
        };
    }
}
exports.StateInspector = StateInspector;
//# sourceMappingURL=StateInspector.js.map