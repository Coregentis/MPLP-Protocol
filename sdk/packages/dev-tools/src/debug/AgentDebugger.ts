/**
 * @fileoverview Agent Debugger - Debug individual agents
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { DebugConfig, AgentDebugInfo, DebugEvent } from '../types/debug';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Agent debugger for debugging individual agents
 */
export class AgentDebugger {
  private eventManager: MPLPEventManager;
  private config: DebugConfig;
  private debuggedAgents: Map<string, AgentDebugInfo> = new Map();
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
   * Start agent debugging
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stop agent debugging
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.debuggedAgents.clear();
    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Attach debugger to agent
   */
  attachToAgent(agentId: string): void {
    if (!this.debuggedAgents.has(agentId)) {
      const debugInfo: AgentDebugInfo = {
        agentId,
        name: `Agent-${agentId}`,
        status: 'idle',
        capabilities: [],
        state: {},
        metrics: {
          totalActions: 0,
          successfulActions: 0,
          failedActions: 0,
          averageResponseTime: 0
        }
      };

      this.debuggedAgents.set(agentId, debugInfo);
      this.emit('agentAttached', { agentId, debugInfo });
    }
  }

  /**
   * Detach debugger from agent
   */
  detachFromAgent(agentId: string): void {
    if (this.debuggedAgents.has(agentId)) {
      const debugInfo = this.debuggedAgents.get(agentId);
      this.debuggedAgents.delete(agentId);
      this.emit('agentDetached', { agentId, debugInfo });
    }
  }

  /**
   * Get agent debug info
   */
  getAgentInfo(agentId: string): AgentDebugInfo | undefined {
    return this.debuggedAgents.get(agentId);
  }

  /**
   * Get all debugged agents
   */
  getAllAgents(): AgentDebugInfo[] {
    return Array.from(this.debuggedAgents.values());
  }

  /**
   * Update agent state
   */
  updateAgentState(agentId: string, state: any): void {
    const debugInfo = this.debuggedAgents.get(agentId);
    if (debugInfo) {
      debugInfo.state = { ...debugInfo.state, ...state };
      this.emit('agentStateUpdated', { agentId, state: debugInfo.state });
    }
  }

  /**
   * Record agent action
   */
  recordAction(agentId: string, action: string, success: boolean, responseTime: number): void {
    const debugInfo = this.debuggedAgents.get(agentId);
    if (debugInfo) {
      debugInfo.currentAction = action;
      debugInfo.metrics.totalActions++;
      
      if (success) {
        debugInfo.metrics.successfulActions++;
      } else {
        debugInfo.metrics.failedActions++;
      }

      // Update average response time
      const totalTime = debugInfo.metrics.averageResponseTime * (debugInfo.metrics.totalActions - 1) + responseTime;
      debugInfo.metrics.averageResponseTime = totalTime / debugInfo.metrics.totalActions;

      this.emit('actionRecorded', { agentId, action, success, responseTime });
    }
  }

  /**
   * Get debugging statistics
   */
  getStatistics(): any {
    return {
      isActive: this.isActive,
      totalAgents: this.debuggedAgents.size,
      activeAgents: Array.from(this.debuggedAgents.values()).filter(a => a.status === 'running').length,
      totalActions: Array.from(this.debuggedAgents.values()).reduce((sum, a) => sum + a.metrics.totalActions, 0),
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * Calculate overall success rate
   */
  private calculateSuccessRate(): number {
    const agents = Array.from(this.debuggedAgents.values());
    const totalActions = agents.reduce((sum, a) => sum + a.metrics.totalActions, 0);
    const successfulActions = agents.reduce((sum, a) => sum + a.metrics.successfulActions, 0);
    
    return totalActions > 0 ? successfulActions / totalActions : 0;
  }
}
