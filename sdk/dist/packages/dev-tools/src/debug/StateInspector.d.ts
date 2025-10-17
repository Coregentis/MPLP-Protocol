/**
 * @fileoverview State Inspector - Inspect component state changes
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { DebugConfig, StateInspectionData } from '../types/debug';
/**
 * State inspector for inspecting component state changes
 */
export declare class StateInspector extends EventEmitter {
    private config;
    private stateHistory;
    private currentStates;
    private isActive;
    private readonly maxHistory;
    constructor(config: DebugConfig);
    /**
     * Start state inspection
     */
    start(): Promise<void>;
    /**
     * Stop state inspection
     */
    stop(): Promise<void>;
    /**
     * Inspect state change
     */
    inspectStateChange(componentId: string, componentType: StateInspectionData['componentType'], newState: any): void;
    /**
     * Get current state of component
     */
    getCurrentState(componentId: string): any;
    /**
     * Get all current states
     */
    getAllCurrentStates(): Map<string, any>;
    /**
     * Get state history for component
     */
    getStateHistory(componentId: string): StateInspectionData[];
    /**
     * Get all state history
     */
    getAllStateHistory(): StateInspectionData[];
    /**
     * Get state history by component type
     */
    getStateHistoryByType(componentType: StateInspectionData['componentType']): StateInspectionData[];
    /**
     * Get state history in time range
     */
    getStateHistoryInTimeRange(startTime: Date, endTime: Date): StateInspectionData[];
    /**
     * Clear state history
     */
    clearHistory(): void;
    /**
     * Calculate state changes between old and new state
     */
    private calculateStateChanges;
    /**
     * Compare two objects recursively
     */
    private compareObjects;
    /**
     * Add changes for all properties in an object
     */
    private addChangesForObject;
    /**
     * Get debugging statistics
     */
    getStatistics(): any;
    /**
     * Get most active components
     */
    private getMostActiveComponents;
    /**
     * Get time range of state changes
     */
    private getTimeRange;
}
//# sourceMappingURL=StateInspector.d.ts.map