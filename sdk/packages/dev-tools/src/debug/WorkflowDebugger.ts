/**
 * @fileoverview Workflow Debugger - Debug workflow execution
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { DebugConfig, WorkflowDebugInfo, WorkflowStepInfo } from '../types/debug';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Workflow debugger for debugging workflow execution
 */
export class WorkflowDebugger {
  private eventManager: MPLPEventManager;
  private config: DebugConfig;
  private debuggedWorkflows: Map<string, WorkflowDebugInfo> = new Map();
  private isActive = false;

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
   * Start workflow debugging
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stop workflow debugging
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.debuggedWorkflows.clear();
    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Start debugging workflow
   */
  startWorkflowDebugging(workflowId: string, name: string): void {
    const debugInfo: WorkflowDebugInfo = {
      workflowId,
      name,
      status: 'pending',
      steps: [],
      startTime: new Date()
    };

    this.debuggedWorkflows.set(workflowId, debugInfo);
    this.emit('workflowStarted', debugInfo);
  }

  /**
   * Update workflow status
   */
  updateWorkflowStatus(workflowId: string, status: WorkflowDebugInfo['status']): void {
    const debugInfo = this.debuggedWorkflows.get(workflowId);
    if (debugInfo) {
      debugInfo.status = status;
      
      if (status === 'completed' || status === 'failed') {
        debugInfo.endTime = new Date();
        debugInfo.duration = debugInfo.endTime.getTime() - debugInfo.startTime.getTime();
      }

      this.emit('workflowStatusUpdated', debugInfo);
    }
  }

  /**
   * Add workflow step
   */
  addWorkflowStep(workflowId: string, stepInfo: Omit<WorkflowStepInfo, 'stepId'>): void {
    const debugInfo = this.debuggedWorkflows.get(workflowId);
    if (debugInfo) {
      const step: WorkflowStepInfo = {
        stepId: `step_${debugInfo.steps.length + 1}`,
        ...stepInfo
      };

      debugInfo.steps.push(step);
      this.emit('stepAdded', { workflowId, step });
    }
  }

  /**
   * Update workflow step
   */
  updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStepInfo>): void {
    const debugInfo = this.debuggedWorkflows.get(workflowId);
    if (debugInfo) {
      const step = debugInfo.steps.find(s => s.stepId === stepId);
      if (step) {
        Object.assign(step, updates);
        
        if (updates.status === 'completed' || updates.status === 'failed') {
          step.endTime = new Date();
          if (step.startTime) {
            step.duration = step.endTime.getTime() - step.startTime.getTime();
          }
        }

        this.emit('stepUpdated', { workflowId, step });
      }
    }
  }

  /**
   * Get workflow debug info
   */
  getWorkflowInfo(workflowId: string): WorkflowDebugInfo | undefined {
    return this.debuggedWorkflows.get(workflowId);
  }

  /**
   * Get all debugged workflows
   */
  getAllWorkflows(): WorkflowDebugInfo[] {
    return Array.from(this.debuggedWorkflows.values());
  }

  /**
   * Get debugging statistics
   */
  getStatistics(): any {
    const workflows = Array.from(this.debuggedWorkflows.values());
    
    return {
      isActive: this.isActive,
      totalWorkflows: workflows.length,
      completedWorkflows: workflows.filter(w => w.status === 'completed').length,
      failedWorkflows: workflows.filter(w => w.status === 'failed').length,
      runningWorkflows: workflows.filter(w => w.status === 'running').length,
      averageDuration: this.calculateAverageDuration(workflows)
    };
  }

  /**
   * Calculate average workflow duration
   */
  private calculateAverageDuration(workflows: WorkflowDebugInfo[]): number {
    const completedWorkflows = workflows.filter(w => w.duration !== undefined);
    if (completedWorkflows.length === 0) {
      return 0;
    }

    const totalDuration = completedWorkflows.reduce((sum, w) => sum + (w.duration || 0), 0);
    return totalDuration / completedWorkflows.length;
  }
}
