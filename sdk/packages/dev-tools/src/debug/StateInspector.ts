/**
 * @fileoverview State Inspector - Inspect component state changes
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { DebugConfig, StateInspectionData, StateChange } from '../types/debug';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * State inspector for inspecting component state changes
 */
export class StateInspector {
  private eventManager: MPLPEventManager;
  private config: DebugConfig;
  private stateHistory: StateInspectionData[] = [];
  private currentStates: Map<string, any> = new Map();
  private isActive = false;
  private readonly maxHistory = 1000;

  constructor(config: DebugConfig) {
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start state inspection
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stop state inspection
   */
  async stop(): Promise<void> {
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
  inspectStateChange(componentId: string, componentType: StateInspectionData['componentType'], newState: any): void {
    if (!this.isActive) {
      return;
    }

    const previousState = this.currentStates.get(componentId);
    const changes = this.calculateStateChanges(previousState, newState);

    const inspectionData: StateInspectionData = {
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
  getCurrentState(componentId: string): any {
    return this.currentStates.get(componentId);
  }

  /**
   * Get all current states
   */
  getAllCurrentStates(): Map<string, any> {
    return new Map(this.currentStates);
  }

  /**
   * Get state history for component
   */
  getStateHistory(componentId: string): StateInspectionData[] {
    return this.stateHistory.filter(data => data.componentId === componentId);
  }

  /**
   * Get all state history
   */
  getAllStateHistory(): StateInspectionData[] {
    return [...this.stateHistory];
  }

  /**
   * Get state history by component type
   */
  getStateHistoryByType(componentType: StateInspectionData['componentType']): StateInspectionData[] {
    return this.stateHistory.filter(data => data.componentType === componentType);
  }

  /**
   * Get state history in time range
   */
  getStateHistoryInTimeRange(startTime: Date, endTime: Date): StateInspectionData[] {
    return this.stateHistory.filter(data => 
      data.timestamp >= startTime && data.timestamp <= endTime
    );
  }

  /**
   * Clear state history
   */
  clearHistory(): void {
    this.stateHistory = [];
    this.emit('historyCleared');
  }

  /**
   * Calculate state changes between old and new state
   */
  private calculateStateChanges(oldState: any, newState: any): StateChange[] {
    const changes: StateChange[] = [];

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
  private compareObjects(oldObj: any, newObj: any, path: string, changes: StateChange[]): void {
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
      } else if (oldObj[key] !== newObj[key]) {
        if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
          this.compareObjects(oldObj[key], newObj[key], currentPath, changes);
        } else {
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
  private addChangesForObject(obj: any, path: string, changes: StateChange[], changeType: StateChange['changeType']): void {
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
  getStatistics(): any {
    const componentTypes = new Map<string, number>();
    const components = new Map<string, number>();

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
  private getMostActiveComponents(components: Map<string, number>): Array<{ componentId: string; changes: number }> {
    return Array.from(components.entries())
      .map(([componentId, changes]) => ({ componentId, changes }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10);
  }

  /**
   * Get time range of state changes
   */
  private getTimeRange(): { start?: Date; end?: Date } {
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
